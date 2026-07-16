

/**
 * Service to verify merchant credibility based on provided details.
 * Implements a multi-layer verification pipeline.
 */
export const verifyMerchant = async (merchantData) => {
  const { email, businessName, businessLocation, website, verificationType } = merchantData;

  let trustScore = 0;
  const breakdown = [];

  // 1. Email Domain Check
  const emailDomain = email.split("@")[1];
  const isGmail = emailDomain === "gmail.com";
  
  if (!isGmail && website) {
    // Basic check: if website includes the email domain
    if (website.includes(emailDomain)) {
      trustScore += 40; // Layer 1: Domain Match
      breakdown.push("✅ Email domain matches website domain (+40)");
    } else {
      trustScore += 20; // Custom domain but not an exact match to the provided website
      breakdown.push("⚠️ Custom email domain but does not match website (+20)");
    }
  } else if (!isGmail) {
    trustScore += 30; // Has custom domain but no website provided
    breakdown.push("✅ Custom email domain provided without website (+30)");
  } else {
    trustScore += 10; // Gmail is allowed but gets lower initial trust
    breakdown.push("⚠️ Free email provider used (Gmail) (+10)");
  }

  // 2. SerpAPI Business Existence Check
  if (businessName && businessLocation && process.env.SERPAPI_KEY) {
    try {
      const query = `${businessName} ${businessLocation}`;
      const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${process.env.SERPAPI_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      let foundBusiness = false;
      let locationMatched = false;

      // Check if organic results contain the business name
      if (data.organic_results && data.organic_results.length > 0) {
        for (const result of data.organic_results) {
          const title = result.title.toLowerCase();
          const snippet = (result.snippet || "").toLowerCase();
          
          if (title.includes(businessName.toLowerCase())) {
            foundBusiness = true;
          }
          
          if (snippet.includes(businessLocation.toLowerCase())) {
            locationMatched = true;
          }
        }
      }

      // Check local results (Google Maps snippet in search)
      if (data.local_results && data.local_results.length > 0) {
        foundBusiness = true;
        locationMatched = true; // Local results usually implies location match
      }

      if (foundBusiness) {
        trustScore += 35; // Layer 2: Business Existence
        breakdown.push("✅ Business found online via Search API (+35)");
      } else {
        breakdown.push("❌ Business could not be found online (+0)");
      }
      
      if (locationMatched) {
        trustScore += 15; // Layer 3: Location Match
        breakdown.push("✅ Business location matched online records (+15)");
      } else if (foundBusiness) {
        breakdown.push("❌ Business location mismatch (+0)");
      }

    } catch (error) {
      console.error("SerpAPI Verification Error:", error);
      breakdown.push("❌ Verification API Error (+0)");
    }
  } else {
    breakdown.push("❌ Missing business details or Search API disabled (+0)");
  }

  // 4. Verification Method Check
  if (verificationType && ["GST Number", "Business Website", "Store License", "Trade License"].includes(verificationType)) {
    trustScore += 10;
    breakdown.push(`✅ Valid verification document provided: ${verificationType} (+10)`);
  }

  return {
    trustScore,
    merchantVerified: trustScore >= 70,
    breakdown,
  };
};
