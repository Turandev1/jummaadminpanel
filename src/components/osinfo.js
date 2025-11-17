import { useEffect, useState } from "react";
import { UAParser } from "ua-parser-js";

export default function useGetClientInfo() {
  const [info, setInfo] = useState({ browser: null, os: null, rawUA: null });

  useEffect(() => {
    (async () => {
      if (navigator.userAgentData) {
        const high = await navigator.userAgentData.getHighEntropyValues([
          "platform",
          "platformVersion",
          "uaFullVersion",
        ]);
        setInfo({
          browser:
            navigator.userAgentData.brands
              ?.map((b) => b.brand + " " + b.version)
              .join(", ") || high.uaFullVersion,
          os:
            high.platform +
            (high.platformVersion ? " " + high.platformVersion : ""),
          rawUA: navigator.userAgent,
        });
        return;
      }

      const ua = navigator.userAgent || "";
      const p = new UAParser(ua);
      const browser = p.getBrowser();
      const os = p.getOS();
      setInfo({
        browser: `${browser.name ?? "unknown"} ${browser.version ?? ""}`.trim(),
        os: `${os.name ?? "unknown"} ${os.version ?? ""}`.trim(),
        rawUA: ua,
      });
    })();
  }, []);

  return info;
}
