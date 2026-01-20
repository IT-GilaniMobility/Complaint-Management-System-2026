// Neo-Brutalist Utility Classes Quick Reference

// BORDERS
.border-3     // 3px border
.border-4     // 4px border  
.border-5     // 5px border
.border-black // Always use black borders

// SHADOWS
.shadow-brutal     // 4px 4px 0px 0px rgba(0,0,0,1)
.shadow-brutal-lg  // 8px 8px 0px 0px rgba(0,0,0,1)
.shadow-brutal-xl  // 12px 12px 0px 0px rgba(0,0,0,1)

// COLORS
.bg-brutal-yellow  // #FFEB3B
.bg-brutal-pink    // #FF4081
.bg-brutal-cyan    // #00BCD4
.bg-brutal-lime    // #CDDC39
.bg-brutal-orange  // #FF9800
.bg-brutal-purple  // #9C27B0

// TYPOGRAPHY
.font-bold        // 700 weight
.font-black       // 900 weight
.uppercase        // Text transform
.tracking-wide    // Letter spacing
.tracking-wider   // More letter spacing

// COMMON PATTERNS

// Brutal Button
className="border-3 border-black shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none"

// Brutal Card  
className="border-4 border-black shadow-brutal-lg"

// Brutal Input
className="border-3 border-black shadow-brutal focus:translate-x-1 focus:translate-y-1 focus:shadow-none"

// Brutal Badge
className="border-2 border-black shadow-brutal uppercase font-bold"

// Colorful Header
className="bg-brutal-purple text-white border-b-4 border-black"

// Active State Ring
className="ring-4 ring-black ring-offset-4"

// ANIMATION PATTERN
// Default: shadow visible, element at original position
// Hover: element moves right+down (1px), shadow stays (visual effect: shadow shrinks)
// Active: element moves further (2px), shadow disappears completely

// Example:
hover:translate-x-1 hover:translate-y-1 
active:translate-x-2 active:translate-y-2 active:shadow-none
