import cron from "node-cron";
import axios from "axios";
export const startPingBackendJob = () => {
  // Schedule job to run every 5 minutes  
  cron.schedule("*/5 * * * *", async () => {
    try { 
      console.log("[CRON] 🔄 Pinging backend...");
      const response = await axios.get(process.env.backend_URL! + "/ping");      
      if (response.status === 200) {        console.log("[CRON] ✅ Backend ping successful");
      } else {        console.log("[CRON] ⚠️ Backend ping returned unexpected status:", response.status);
      }    } catch (error) {
      if(error instanceof Error){
        console.log("[CRON] ❌ Backend ping failed:", error.message);
      }  
     }
  }, {
    timezone: "Asia/Kolkata"  });
  console.log("[CRON] ✅ Scheduled: Backend ping check every 5 minutes");
};











