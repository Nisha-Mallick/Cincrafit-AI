export const detectDomain = (query) => {
  const q = query.toLowerCase();

  //Movie / Entertainment
  if (
    q.includes("movie") ||
    q.includes("ticket") ||
    q.includes("cinema") ||
    q.includes("netflix") ||
    q.includes("prime") ||
    q.includes("ott")
  ) {
    return "movie";
  }

  //Fashion
  if (
    q.includes("fashion") ||
    q.includes("clothes") ||
    q.includes("shirt") ||
    q.includes("shoes")
  ) {
    return "fashion";
  }

  //Food
  if (
    q.includes("food") ||
    q.includes("restaurant") ||
    q.includes("pizza") ||
    q.includes("burger")
  ) {
    return "food";
  }

  if (
    q.includes("offer") ||
    q.includes("deal") ||
    q.includes("discount") ||
    q.includes("price") ||
    q.includes("coupon") ||
    q.includes("code") ||
    q.includes("valid")
  ) {
    return "all";
  }

  return "all";
};
