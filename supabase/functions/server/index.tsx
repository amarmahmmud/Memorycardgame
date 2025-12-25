import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-e2ec6e19/health", (c) => {
  return c.json({ status: "ok" });
});

// Get all levels
app.get("/make-server-e2ec6e19/levels", async (c) => {
  try {
    const levels = await kv.getByPrefix("level:");
    return c.json({ levels: levels || [] });
  } catch (error) {
    console.log("Error fetching levels:", error);
    return c.json({ error: "Failed to fetch levels", details: String(error) }, 500);
  }
});

// Get level by ID
app.get("/make-server-e2ec6e19/levels/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const level = await kv.get(`level:${id}`);
    
    if (!level) {
      return c.json({ error: "Level not found" }, 404);
    }
    
    return c.json({ level });
  } catch (error) {
    console.log("Error fetching level:", error);
    return c.json({ error: "Failed to fetch level", details: String(error) }, 500);
  }
});

// Create or update level
app.post("/make-server-e2ec6e19/levels", async (c) => {
  try {
    const body = await c.req.json();
    const { id, name, pairs } = body;
    
    if (!id || !name || !pairs) {
      return c.json({ error: "Missing required fields: id, name, pairs" }, 400);
    }
    
    const level = {
      id,
      name,
      pairs,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`level:${id}`, level);
    
    return c.json({ success: true, level });
  } catch (error) {
    console.log("Error creating/updating level:", error);
    return c.json({ error: "Failed to create/update level", details: String(error) }, 500);
  }
});

// Delete level
app.delete("/make-server-e2ec6e19/levels/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`level:${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting level:", error);
    return c.json({ error: "Failed to delete level", details: String(error) }, 500);
  }
});

// Clear all levels
app.delete("/make-server-e2ec6e19/levels", async (c) => {
  try {
    const levels = await kv.getByPrefix("level:");
    for (const level of levels || []) {
      await kv.del(`level:${level.id}`);
    }
    
    return c.json({ success: true, message: "All levels cleared" });
  } catch (error) {
    console.log("Error clearing levels:", error);
    return c.json({ error: "Failed to clear levels", details: String(error) }, 500);
  }
});

// Initialize demo data
app.post("/make-server-e2ec6e19/init-demo", async (c) => {
  try {
    // Check if demo data already exists
    const existingLevels = await kv.getByPrefix("level:");
    if (existingLevels && existingLevels.length > 0) {
      // Clear existing levels if force parameter is provided
      const body = await c.req.json().catch(() => ({}));
      if (body.force) {
        for (const level of existingLevels) {
          await kv.del(`level:${level.id}`);
        }
      } else {
        return c.json({ message: "Demo data already exists", levels: existingLevels });
      }
    }
    
    // Level 1: 2 pairs (Easy)
    const level1 = {
      id: "1",
      name: "ደረጃ 1 - ቀላል",
      pairs: [
        {
          id: "pair1",
          arabicWord: "كتاب",
          amharicWord: "መጽሐፍ",
          imageUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rfGVufDF8fHx8MTc2NjYzNzMwN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        },
        {
          id: "pair2",
          arabicWord: "قلم",
          amharicWord: "እስክርብቶ",
          imageUrl: "https://images.unsplash.com/photo-1597754255385-b48c3627d3df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW4lMjBwZW5jaWx8ZW58MXx8fHwxNzY2NTc0NjYyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        },
      ],
      createdAt: new Date().toISOString(),
    };
    
    // Level 2: 3 pairs (Medium)
    const level2 = {
      id: "2",
      name: "ደረጃ 2 - መካከለኛ",
      pairs: [
        {
          id: "pair1",
          arabicWord: "تفاحة",
          amharicWord: "ፖም",
          imageUrl: "https://images.unsplash.com/photo-1713959925337-3a79df64fccd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcHBsZSUyMGZydWl0fGVufDF8fHx8MTc2NjU2NzExOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        },
        {
          id: "pair2",
          arabicWord: "بيت",
          amharicWord: "ቤት",
          imageUrl: "https://images.unsplash.com/photo-1672508061327-6efaa65896e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3VzZSUyMGhvbWV8ZW58MXx8fHwxNzY2NTY3MTIxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        },
        {
          id: "pair3",
          arabicWord: "سيارة",
          amharicWord: "መኪና",
          imageUrl: "https://images.unsplash.com/photo-1668764340793-06b6f00ea4d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjB2ZWhpY2xlfGVufDF8fHx8MTc2NjYzNzMwOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        },
      ],
      createdAt: new Date().toISOString(),
    };
    
    // Level 3: 4 pairs (Hard)
    const level3 = {
      id: "3",
      name: "ደረጃ 3 - አስቸጋሪ",
      pairs: [
        {
          id: "pair1",
          arabicWord: "شمس",
          amharicWord: "ፀሐይ",
          imageUrl: "https://images.unsplash.com/photo-1604949210966-9440c324823f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW4lMjBza3l8ZW58MXx8fHwxNzY2NjE2NTg2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        },
        {
          id: "pair2",
          arabicWord: "ماء",
          amharicWord: "ውሃ",
          imageUrl: "https://images.unsplash.com/photo-1549372691-289fcc650e4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlciUyMGN1cHxlbnwxfHx8fDE3NjY2MzczMDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        },
        {
          id: "pair3",
          arabicWord: "قطة",
          amharicWord: "ድመት",
          imageUrl: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXQlMjBwZXR8ZW58MXx8fHwxNzY2NjE2NTgxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        },
        {
          id: "pair4",
          arabicWord: "شجرة",
          amharicWord: "ዛፍ",
          imageUrl: "https://images.unsplash.com/photo-1660098653763-71c9e7e5fd40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmVlJTIwbmF0dXJlfGVufDF8fHx8MTc2NjU5NTgyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        },
      ],
      createdAt: new Date().toISOString(),
    };
    
    // Level 4: 5 pairs (Expert)
    const level4 = {
      id: "4",
      name: "ደረጃ 4 - ባለሙያ",
      pairs: [
        {
          id: "pair1",
          arabicWord: "قمر",
          amharicWord: "ጨረቃ",
          imageUrl: "https://images.unsplash.com/photo-1535332371349-a5d229f49cb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb29uJTIwbmlnaHR8ZW58MXx8fHwxNzY2NTY3MTIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        },
        {
          id: "pair2",
          arabicWord: "وردة",
          amharicWord: "አበባ",
          imageUrl: "https://images.unsplash.com/photo-1496062031456-07b8f162a322?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG93ZXIlMjByb3NlfGVufDF8fHx8MTc2NjYzNzMxMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        },
        {
          id: "pair3",
          arabicWord: "طائر",
          amharicWord: "ወፍ",
          imageUrl: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJkfGVufDF8fHx8MTc2NjYzNzMxMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        },
        {
          id: "pair4",
          arabicWord: "كتاب",
          amharicWord: "መጽሐፍ",
          imageUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rfGVufDF8fHx8MTc2NjYzNzMwN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        },
        {
          id: "pair5",
          arabicWord: "قلم",
          amharicWord: "እስክርብቶ",
          imageUrl: "https://images.unsplash.com/photo-1597754255385-b48c3627d3df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW4lMjBwZW5jaWx8ZW58MXx8fHwxNzY2NTc0NjYyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        },
      ],
      createdAt: new Date().toISOString(),
    };
    
    await kv.set("level:1", level1);
    await kv.set("level:2", level2);
    await kv.set("level:3", level3);
    await kv.set("level:4", level4);
    
    return c.json({ 
      success: true, 
      levels: [level1, level2, level3, level4],
      message: "4 levels initialized with increasing difficulty"
    });
  } catch (error) {
    console.log("Error initializing demo data:", error);
    return c.json({ error: "Failed to initialize demo data", details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);