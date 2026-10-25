// =============================================================
// OCR · detect.js
// Nhận diện tab (Giao / Lấy / Hoàn) từ gạch chân màu cam trên ảnh chụp màn hình SPX.
// =============================================================

// ==================== PHÁT HIỆN TAB ====================
// Đã tối ưu để chống nhiễu từ Dynamic Island (icon màu cam) và Status Bar
export function detectActiveTabByOrangeLine(imageSource) {
  if (typeof window !== 'undefined') window.__spxLastTabDetect = null;

  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const W = img.width, H = img.height;
        const canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // 1. Bỏ qua Status Bar và Dynamic Island (Quét từ 8% đến 35% chiều cao)
        const yStart = Math.floor(H * 0.08);
        const yEnd   = Math.floor(H * 0.35);
        const scanH  = Math.max(1, yEnd - yStart);
        const data = ctx.getImageData(0, yStart, W, scanH).data;

        // Màu cam của SPX (Đã test trên ảnh của bạn)
        const isOrange = (r, g, b) =>
          r > 200 && g >= 40 && g <= 160 && b <= 110 && (r - g) > 60;

        // Đếm pixel cam theo HÀNG (để tìm gạch chân ngang)
        const rowCount = new Array(scanH).fill(0);
        let totalOrange = 0;

        for (let y = 0; y < scanH; y++) {
          let rowOr = 0;
          for (let x = 0; x < W; x++) {
            const i = (y * W + x) * 4;
            if (isOrange(data[i], data[i + 1], data[i + 2])) {
              rowOr++;
              totalOrange++;
            }
          }
          rowCount[y] = rowOr;
        }

        if (totalOrange < 30) { resolve(null); return; }

        // 2. Tìm hàng có gạch chân (độ rộng >= 15% màn hình)
        // Tab underline thường rộng ~20%, Dynamic island chỉ ~10% nên sẽ bị loại
        const minRowWidth = W * 0.15;
        let bestRow = -1, bestRowCount = 0;
        for (let y = 0; y < scanH; y++) {
          if (rowCount[y] > bestRowCount && rowCount[y] >= minRowWidth) {
            bestRowCount = rowCount[y];
            bestRow = y;
          }
        }

        let centerX;
        let method;

        if (bestRow === -1) {
          // Fallback: Nếu không tìm thấy hàng ngang rõ ràng (ít gặp)
          method = 'column-peak';
          const colCount = new Array(W).fill(0);
          for (let y = 0; y < scanH; y++) {
            for (let x = 0; x < W; x++) {
              const i = (y * W + x) * 4;
              if (isOrange(data[i], data[i + 1], data[i + 2])) colCount[x]++;
            }
          }
          const winSize = 60;
          let maxSum = 0, bestCenter = 0;
          for (let x = 0; x < W; x++) {
            let sum = 0;
            const l = Math.max(0, x - winSize);
            const r = Math.min(W - 1, x + winSize);
            for (let k = l; k <= r; k++) sum += colCount[k];
            if (sum > maxSum) { maxSum = sum; bestCenter = x; }
          }
          centerX = bestCenter;
        } else {
          // Đã tìm thấy gạch chân -> Tính trung bình X của dải màu cam đó
          method = 'row-band';
          const bandTop = Math.max(0, bestRow - 3);
          const bandBot = Math.min(scanH - 1, bestRow + 3);
          let sumW = 0, sumWX = 0;
          for (let x = 0; x < W; x++) {
            let c = 0;
            for (let y = bandTop; y <= bandBot; y++) {
              const i = (y * W + x) * 4;
              if (isOrange(data[i], data[i + 1], data[i + 2])) c++;
            }
            sumW += c;
            sumWX += x * c;
          }
          centerX = sumW > 0 ? sumWX / sumW : W / 2;
        }

        // 3. Chia 3 vùng X đều nhau (33% - 33% - 33%)
        const rel = centerX / W;
        let tab;
        if (rel < 0.33) tab = 'del';       // Giao
        else if (rel < 0.66) tab = 'pick'; // Lấy
        else tab = 'ret';                  // Hoàn

        // Ghi log để debug nếu cần
        if (typeof window !== 'undefined') {
          window.__spxLastTabDetect = {
            imgW: W, imgH: H, yScan: [yStart, yEnd],
            bestRow: bestRow === -1 ? null : yStart + bestRow,
            bestRowCount, minRowWidth: Math.round(minRowWidth),
            totalOrange, centerX: Math.round(centerX),
            relPct: +(rel * 100).toFixed(1), method, tab
          };
        }
        resolve(tab);
      } catch (e) {
        console.warn('[OCR] detectActiveTab error:', e);
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imageSource;
  });
}
