import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

export const useQRScan = () => {
  const navigate = useNavigate();

  const handleScan = async (decodedText) => {
    if (!decodedText) return;

    // ── Extract short code or ID from whatever the QR contains ──
    let code = decodedText.trim();
    console.log("before mod", code);
    // If it's a URL extract the last path segment
    try {
      const url = new URL(code);
      const parts = url.pathname.split("/").filter(Boolean).slice(-2);
      if (parts.at(-1) === "carton") code = parts;
      else code = parts.slice(-1);
    } catch {
      // Not a URL — use raw value as-is
    }
    console.log("after mod", code);

    if (!code) {
      toast.error("Could not read QR code");
      return;
    }

    // Show loading toast while calling verify API
    const toastId = toast.loading("Verifying product...");
    try {
      // Determine endpoint — short code vs MongoDB ObjectId
      const isCarton = code.at(-1) === "carton";
      const cleanCode = code[0];
      const isMongoId = /^[a-f0-9]{24}$/i.test(cleanCode);

      let endpoint;
      if (isMongoId) {
        endpoint = isCarton
          ? `/verify/${cleanCode}/carton`
          : `/verify/${cleanCode}`;
      } else {
        endpoint = `/verify/${cleanCode}`;
      }
      console.log("endpoint : ", endpoint);
      toast.dismiss(toastId);

      // Navigate to verify page with result preloaded
      navigate(endpoint);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Could not read QR code");
    }
  };

  return { handleScan };
};
