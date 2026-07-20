import { useEffect, useRef, useState } from "react";

interface AdBannerProps {
  zoneKey: string;
  width: number;
  height: number;
}

export default function AdBanner({ zoneKey, width, height }: AdBannerProps) {
  const bannerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // 📱 මොබයිල් screen වලදී ad එක auto-scale කර සයිට් එක කැඩීම වැළැක්වීම
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const padding = 32; // mobile screen padding
      const availableWidth = window.innerWidth - padding;

      if (availableWidth < width) {
        setScale(availableWidth / width);
      } else {
        setScale(1);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [width]);

  // 🚀 Ads දෙකම ගැටලුවකින් තොරව load කිරීම (Dynamic DOM injection)
  useEffect(() => {
    if (typeof window === "undefined" || !bannerRef.current) return;
    if (bannerRef.current.hasChildNodes()) return;

    // Global config එක overwrite වීම වැළැක්වීම සඳහා inline script එකක් සෑදීම
    const confScript = document.createElement("script");
    confScript.type = "text/javascript";
    confScript.innerHTML = `
      atOptions = {
        'key' : '${zoneKey}',
        'format' : 'iframe',
        'height' : ${height},
        'width' : ${width},
        'params' : {}
      };
    `;

    // Ad invoke කරන ප්‍රධාන script එක
    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = `//acorntar.com/${zoneKey}/invoke.js`;

    // container එක ඇතුළට පිළිවෙලින් ඇතුළත් කිරීම
    bannerRef.current.appendChild(confScript);
    bannerRef.current.appendChild(invokeScript);

    return () => {
      if (bannerRef.current) {
        bannerRef.current.innerHTML = "";
      }
    };
  }, [zoneKey, width, height]);

  // Scale වීම නිසා ඇතිවන හිස්තැන (blank space) මඟහැරීමට height එක ගණනය කිරීම
  const scaledHeight = height * scale;

  return (
    <div 
      className="flex justify-center my-4 w-full overflow-hidden" 
      style={{ height: `${scaledHeight}px` }}
    >
      <div 
        style={{ 
          width: `${width}px`, 
          height: `${height}px`,
          transform: `scale(${scale})`,
          transformOrigin: "center top"
        }}
        className="shrink-0"
      >
        <div 
          ref={bannerRef} 
          className="overflow-hidden bg-muted/10 rounded-lg w-full h-full"
        />
      </div>
    </div>
  );
}
