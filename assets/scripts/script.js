function generateSDFBackground(element, width = 300, height = 300,
    borderColor = '#FFFFFF', insideColor = '#FF0000', outsideColor = '#0000FF', opacity = 0.5) {

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Generate random points for the polygon
    const numPoints = 10; // Number of vertices (e.g., quadrilateral)
    let points = [];
    for (let i = 0; i < numPoints; i++) {
        let x = Math.random() * (width - 100) + 50; // Random x between 50 and width-50
        let y = Math.random() * (height - 100) + 50; // Random y between 50 and height-50
        points.push({x, y});
    }

    // Sort points by angle to form a convex polygon (avoid self-intersections)
    const center = points.reduce((acc, p) => ({x: acc.x + p.x / numPoints, y: acc.y + p.y / numPoints}), {x: 0, y: 0});
    points.sort((a, b) => Math.atan2(a.y - center.y, a.x - center.x) - Math.atan2(b.y - center.y, b.x - center.x));

    // Use the sorted points as the shape
    const shape = points;

    function pointToPolygonDist(px, py, poly) {
        let minDist = Infinity;
        for(let i=0;i<poly.length;i++){
            const p1 = poly[i], p2 = poly[(i+1)%poly.length];
            const A = px - p1.x, B = py - p1.y;
            const C = p2.x - p1.x, D = p2.y - p1.y;
            const dot = A*C + B*D;
            const len_sq = C*C + D*D;
            let t = Math.max(0, Math.min(1, dot / len_sq));
            const dx = p1.x + t*C - px;
            const dy = p1.y + t*D - py;
            minDist = Math.min(minDist, Math.sqrt(dx*dx + dy*dy));
        }
        let inside=false;
        for(let i=0,j=poly.length-1;i<poly.length;j=i++){
            if((poly[i].y>py)!=(poly[j].y>py) &&
               px<(poly[j].x-poly[i].x)*(py-poly[i].y)/(poly[j].y-poly[i].y)+poly[i].x)
                inside=!inside;
        }
        return inside ? -minDist : minDist;
    }

    function colorToRGB(color){
        const c = document.createElement('div');
        c.style.color = color;
        document.body.appendChild(c);
        const rgb = getComputedStyle(c).color.match(/\d+/g).map(Number);
        document.body.removeChild(c);
        return rgb;
    }

    const insideRGB = colorToRGB(insideColor);
    const borderRGB = colorToRGB(borderColor);
    const outsideRGB = colorToRGB(outsideColor);

    const maxDist = 50;
    const img = ctx.createImageData(width, height);

    for(let y=0;y<height;y++){
        for(let x=0;x<width;x++){
            const d = pointToPolygonDist(x,y,shape);

            let r,g,b;
            const t = Math.max(-1, Math.min(1, d / maxDist)); // normalize to [-1,1]

            if(t < 0){ // inside
                const tt = 1 - Math.abs(t); // 1 at border, 0 deep inside
                r = borderRGB[0]*tt + insideRGB[0]*(1-tt);
                g = borderRGB[1]*tt + insideRGB[1]*(1-tt);
                b = borderRGB[2]*tt + insideRGB[2]*(1-tt);
            } else { // outside
                const tt = 1 - t; // 1 at border, 0 far away
                r = borderRGB[0]*tt + outsideRGB[0]*(1-tt);
                g = borderRGB[1]*tt + outsideRGB[1]*(1-tt);
                b = borderRGB[2]*tt + outsideRGB[2]*(1-tt);
            }

            const idx = (y*width+x)*4;
            img.data[idx] = r;
            img.data[idx+1] = g;
            img.data[idx+2] = b;
            img.data[idx+3] = Math.round(255 * opacity);
        }
    }

    ctx.putImageData(img,0,0);
    element.style.backgroundImage = `url(${canvas.toDataURL()})`;
}

// Usage
const cards = document.getElementsByClassName('card'); // Remove the dot

// Convert HTMLCollection to array and loop through each card
Array.from(cards).forEach(card => {
    generateSDFBackground(card, 300, 300, '#FFFFFF', '#ab2673', '#6CACE4', 0.5);
});


