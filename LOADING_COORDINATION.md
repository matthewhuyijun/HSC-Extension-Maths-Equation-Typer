# Loading Animation Coordination

## Problem
The main project has a loading animation that fades out after the page loads. However, MathLive loads asynchronously and could show loading effects (skeleton UI, placeholders, or initialization flashes) after the main loading animation completes. Similarly, the embedded LaTeXLive iframe could show its own loading animation or content flash after the main loading completes, creating a jarring user experience.

## Solution
Implemented a coordinated loading system that ensures:
1. The main loading screen stays visible until **ALL THREE** components are fully initialized: page, MathLive, AND LaTeXLive iframe
2. The MathLive math-field element remains hidden (opacity: 0) until it's fully ready
3. The LaTeXLive iframe remains hidden (opacity: 0) until it's fully loaded and styled
4. All components transition smoothly with no flash or jarring effects

## Implementation Details

### CSS Changes

#### MathLive Field (Lines 2384-2393)
```css
/* Hide math-field until fully loaded to prevent flash */
#mf2:not(.mathlive-ready) {
  opacity: 0;
  pointer-events: none;
}

#mf2.mathlive-ready {
  opacity: 1;
  transition: opacity 0.3s ease;
}
```
- The `#mf2` element (MathLive math-field) is hidden by default
- Only becomes visible when the `mathlive-ready` class is added
- Smooth 0.3s fade-in transition

#### LaTeXLive Iframe (Lines 2395-2404)
```css
/* Hide LaTeXLive iframe until fully loaded to prevent flash */
#latexEnterFrame:not(.iframe-ready) {
  opacity: 0;
  pointer-events: none;
}

#latexEnterFrame.iframe-ready {
  opacity: 1;
  transition: opacity 0.3s ease;
}
```
- The `#latexEnterFrame` iframe is hidden by default
- Only becomes visible when the `iframe-ready` class is added
- Smooth 0.3s fade-in transition
- Prevents any flash or loading animation from the embedded LaTeXLive editor

### JavaScript Changes

#### 1. Loading Screen Coordination (Lines 5610-5637)
```javascript
// Global flags to track component readiness
window.mathLiveReady = false;
window.latexLiveIframeReady = false;

// Function to check if we can hide the loading screen
function checkAndHideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  const mf2 = document.getElementById('mf2');
  
  // Only hide if all components are ready: window loaded, MathLive ready, AND LaTeXLive iframe ready
  if (window.mathLiveReady && 
      window.latexLiveIframeReady && 
      loadingScreen && 
      mf2 && 
      mf2.classList.contains('mathlive-ready')) {
    setTimeout(() => {
      loadingScreen.classList.add('fade-out');
      setTimeout(() => {
        loadingScreen.remove();
      }, 500);
    }, 200);
  }
}

window.addEventListener('load', () => {
  window.mathLiveReady = true;
  checkAndHideLoadingScreen();
});
```

#### 2. MathLive Ready Signal (Lines 4430-4461)
```javascript
if(loaded && window.MathfieldElement){
    configureMathLive();
    
    // Mark MathLive as ready - this will make it visible
    if (mf2) {
        mf2.classList.add('mathlive-ready');
        
        // Check if we can hide the loading screen now
        if (typeof checkAndHideLoadingScreen === 'function') {
            checkAndHideLoadingScreen();
        }
    }
    // ... rest of initialization
}
```

#### 3. LaTeXLive Iframe Ready Signal (Lines 2775-2780)
```javascript
// Mark iframe as ready and check if we can hide the loading screen
latexFrame.classList.add('iframe-ready');
window.latexLiveIframeReady = true;
if (typeof checkAndHideLoadingScreen === 'function') {
  checkAndHideLoadingScreen();
}
```
- Called at the end of the iframe `load` event handler
- After all styling and configuration is complete
- Ensures iframe content is fully ready before becoming visible

## Loading Sequence

1. **Page loads**: Loading screen is visible, all components hidden
2. **HTML/CSS/JS parsed**: MathLive and LaTeXLive iframe start loading asynchronously
3. **Window 'load' event fires**: Sets `window.mathLiveReady = true`, calls check function
4. **MathLive fully initialized**: 
   - Adds `mathlive-ready` class to `#mf2`
   - Makes math-field visible (opacity: 0 → 1)
   - Calls check function
5. **LaTeXLive iframe fully loaded**:
   - Adds `iframe-ready` class to `#latexEnterFrame`
   - Makes iframe visible (opacity: 0 → 1)
   - Sets `window.latexLiveIframeReady = true`
   - Calls check function
6. **All three conditions met**: 
   - Loading screen fades out (200ms delay + 500ms fade = 700ms total)
   - User sees fully-initialized interface with no flashes from any component

## Benefits
- ✅ No visual flash or "pop-in" of MathLive interface
- ✅ No visual flash or loading animation from LaTeXLive iframe
- ✅ Loading screen stays visible until everything is truly ready
- ✅ Smooth, professional loading experience
- ✅ Works regardless of which component loads first (page, MathLive, or iframe)
- ✅ Prevents user interaction with uninitialized components
- ✅ All components fade in smoothly and simultaneously

## Testing
Visit `http://localhost:1234` and observe:
- Loading spinner appears
- Interface only shows when fully ready (all three components initialized)
- No flash of unstyled math-field
- No flash or loading animation from the LaTeXLive embed
- Smooth fade transitions for all components

