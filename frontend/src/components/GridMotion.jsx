import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './GridMotion.css';

const GridMotion = ({ items = [], gradientColor = 'black' }) => {
  const gridRef = useRef(null);
  const rowRefs = useRef([]);

  const totalItems = 21;
  const defaultItems = Array.from({ length: totalItems }, (_, index) => `Item ${index + 1}`);
  
  // If we have items but fewer than 28, cycle them to fill the grid
  const combinedItems = [];
  if (items.length > 0) {
    for (let i = 0; i < totalItems; i++) {
      combinedItems.push(items[i % items.length]);
    }
  } else {
    combinedItems.push(...defaultItems);
  }

  useEffect(() => {
    gsap.ticker.lagSmoothing(0);

    let time = 0;
    let isHovered = false;

    const handleMouseEnter = () => { isHovered = true; };
    const handleMouseLeave = () => { isHovered = false; };

    const gridEl = gridRef.current;
    if (gridEl) {
      gridEl.addEventListener('mouseenter', handleMouseEnter);
      gridEl.addEventListener('mouseleave', handleMouseLeave);
    }

    const updateMotion = () => {
      // Advance time only if not hovered
      if (!isHovered) {
        time += 0.003; // Adjust speed of rolling here
      }

      // Sine wave creates a smooth back-and-forth rolling effect automatically
      const fakeMouseX = ((Math.sin(time) + 1) / 2) * window.innerWidth;

      const maxMoveAmount = 300;
      const baseDuration = 0.8;
      const inertiaFactors = [0.6, 0.4, 0.3, 0.2];

      rowRefs.current.forEach((row, index) => {
        if (row) {
          const direction = index % 2 === 0 ? 1 : -1;
          const moveAmount = ((fakeMouseX / window.innerWidth) * maxMoveAmount - maxMoveAmount / 2) * direction;

          gsap.to(row, {
            x: moveAmount,
            duration: baseDuration + inertiaFactors[index % inertiaFactors.length],
            ease: 'power3.out',
            overwrite: 'auto'
          });
        }
      });
    };

    const removeAnimationLoop = gsap.ticker.add(updateMotion);

    return () => {
      removeAnimationLoop();
      if (gridEl) {
        gridEl.removeEventListener('mouseenter', handleMouseEnter);
        gridEl.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <div className="noscroll loading" ref={gridRef}>
      <section
        className="intro"
        style={{
          background: `radial-gradient(circle, ${gradientColor} 0%, transparent 100%)`
        }}
      >
        <div className="gridMotion-container">
          {[...Array(3)].map((_, rowIndex) => (
            <div key={rowIndex} className="row" ref={el => (rowRefs.current[rowIndex] = el)}>
              {[...Array(7)].map((_, itemIndex) => {
                const content = combinedItems[rowIndex * 7 + itemIndex];
                return (
                  <div key={itemIndex} className="row__item">
                    <div className="row__item-inner" style={{ backgroundColor: '#111' }}>
                      {typeof content === 'string' && (content.startsWith('http') || content.startsWith('/src/assets') || content.startsWith('data:image')) ? (
                        <div
                          className="row__item-img"
                          style={{
                            backgroundImage: `url(${content})`
                          }}
                        ></div>
                      ) : React.isValidElement(content) ? (
                        <div className="row__item-content">{content}</div>
                      ) : (
                        <div className="row__item-content">{content}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="fullview"></div>
      </section>
    </div>
  );
};

export default GridMotion;
