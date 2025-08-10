const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const crypto = require("crypto");
require("dotenv").config();

const psr = new mongoose.Schema({
  gmail: { type: String, required: true, unique: true },
  verified: { type: Boolean, default: false },
  code: { type: String },
  points: { type: Number, default: 100 }, 
  cart: [
    {
      title: String,
      pts: Number,
      daysLeft: Number,
    }
  ],
  reqs: [
    {
      item: String,
      amt: Number,
      pts: Number,
      desc: String,
    }
  ]
});

const marketplaceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  pts: { type: Number, required: true },
  stock: { type: Number, required: true },
  image: { type: String, required: true },
  daysLeft: { type: Number, required: true }
});

const ps = mongoose.model("User", psr);
const MarketplaceItem = mongoose.model("MarketplaceItem", marketplaceSchema);

async function initializeMarketplace() {
  try {
    const count = await MarketplaceItem.countDocuments();
    if (count === 0) {
      const items = [
        {
          title: "Merch - T-shirt",
          pts: 12,
          stock: 10,
          image: "/assets/mockup1.png",
          daysLeft: 30
        },
        {
          title: "Eco Water Bottle",
          pts: 8,
          stock: 15,
          image: "/assets/mockup1.png",
          daysLeft: 25
        },
        {
          title: "Reusable Bag",
          pts: 6,
          stock: 20,
          image: "/assets/mockup1.png",
          daysLeft: 40
        },
        {
          title: "Solar Charger",
          pts: 20,
          stock: 5,
          image: "/assets/mockup1.png",
          daysLeft: 15
        }
      ];
      
      await MarketplaceItem.insertMany(items);
      console.log("Marketplace items initialized");
    }
  } catch (err) {
    console.error("Error initializing marketplace:", err);
  }
}

initializeMarketplace();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function signValue(value) {
  const hmac = crypto.createHmac("sha256", process.env.SECRET)
                     .update(value)
                     .digest("hex");
  return `${value}|${hmac}`;
}

function verifySignedValue(signedValue) {
  const parts = signedValue.split("|");
  if (parts.length !== 2) return null;
  const [value, signature] = parts;
  const expected = crypto.createHmac("sha256", process.env.SECRET)
                          .update(value)
                          .digest("hex");
  const match = crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expected, "hex")
  );
  return match ? value : null;
}

router.post("/sign-up", async (req, res) => {
  const { gmail } = req.body;
  if (!gmail) return res.status(400).json({ error: "Gmail is required" });

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    let user = await ps.findOne({ gmail });

    if (user) {
      if (user.verified) {
        return res.status(400).json({ error: "A user with this Gmail already exists" });
      }
      user.code = code;
    } else {
      user = new ps({ 
        gmail, 
        verified: false, 
        code, 
        points: 100, 
        cart: [], 
        reqs: [] 
      });
    }

    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: gmail,
      subject: "Eco Hub - Verify Yourself",
      text: `Your verification code is: ${code} | Make sure not to lose it!`
    });

    res.status(200).json({ message: "Verification code sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/verify", async (req, res) => {
  const { gmail, code } = req.body;
  if (!gmail || !code) return res.status(400).json({ error: "Missing gmail or code" });

  try {
    const user = await ps.findOne({ gmail });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.code !== code) return res.status(401).json({ error: "Invalid code" });

    user.verified = true;
    await user.save();

    const signed = signValue(gmail);
    res.cookie("is_auth", signed, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax"
    });

    res.json({ message: "Verification successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/check-auth", async (req, res) => {
  const gmail = verifySignedValue(req.cookies?.is_auth || "");
  res.status(200).json({ is_auth: !!gmail});
});

router.get("/out", async (req, res) => {
  res.clearCookie("is_auth");
  res.redirect("/");
});

router.get("/get-auth", async (req, res) => {
    try {
        const signedValue = req.cookies?.is_auth || "";
        const gmail = verifySignedValue(signedValue);
        if (!gmail) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const user = await ps.findOne({ gmail });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const username = gmail.split("@")[0];

        res.status(200).json({
            username,
            pts: user.points || 0 
        });

    } catch (err) {
        console.error("Error in get-auth:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/new-req", async (req, res) => {
    try {
        const signedValue = req.cookies?.is_auth || "";
        const gmail = verifySignedValue(signedValue);

        if (!gmail) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const { item, amt, pts, desc } = req.body;
        if (!item || typeof amt !== "number" || typeof pts !== "number" || !desc) {
            return res.status(400).json({ error: "Missing or invalid request data" });
        }

        const user = await ps.findOne({ gmail });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.reqs.push({ item, amt, pts, desc });
        
        user.points = (user.points || 0) + pts;
        
        await user.save();

        res.status(201).json({ 
            message: "Request added successfully", 
            pointsEarned: pts,
            totalPoints: user.points
        });
    } catch (err) {
        console.error("Error in new-req:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/requests", async (req, res) => {
    try {
        const allUsers = await ps.find({}, { gmail: 1, reqs: 1 });
        const allReqs = allUsers.flatMap(user =>
            user.reqs.map(r => ({
                gmail: user.gmail,
                item: r.item,
                amt: r.amt,
                pts: r.pts,
                desc: r.desc
            }))
        );

        res.status(200).json(allReqs);
    } catch (err) {
        console.error("Error in all-reqs:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/marketplace-items", async (req, res) => {
    try {
        const items = await MarketplaceItem.find({});
        res.status(200).json(items);
    } catch (err) {
        console.error("Error fetching marketplace items:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/new-cart", async (req, res) => {
    try {
        const signedValue = req.cookies?.is_auth || "";
        const gmail = verifySignedValue(signedValue);

        if (!gmail) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const { title, pts, daysLeft } = req.body;
        if (!title || typeof pts !== "number" || typeof daysLeft !== "number") {
            return res.status(400).json({ error: "Missing or invalid cart data" });
        }

        const user = await ps.findOne({ gmail });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.points < pts) {
            return res.status(400).json({ 
                error: `Insufficient points. You need ${pts} points but only have ${user.points}.` 
            });
        }

        const marketplaceItem = await MarketplaceItem.findOne({ title });
        if (!marketplaceItem) {
            return res.status(404).json({ error: "Item not found in marketplace" });
        }

        if (marketplaceItem.stock <= 0) {
            return res.status(400).json({ error: "Item is out of stock" });
        }

        user.points -= pts;
        
        user.cart.push({ title, pts, daysLeft });
        
        marketplaceItem.stock -= 1;

        await user.save();
        await marketplaceItem.save();

        res.status(201).json({ 
            message: "Item purchased successfully",
            remainingPoints: user.points,
            remainingStock: marketplaceItem.stock
        });
    } catch (err) {
        console.error("Error in new-cart:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/all-carts", async (req, res) => {
    try {
        const allUsers = await ps.find({}, { gmail: 1, cart: 1 });

        const allCarts = allUsers.flatMap(user =>
            user.cart.map(c => ({
                gmail: user.gmail,
                title: c.title,
                pts: c.pts,
                daysLeft: c.daysLeft
            }))
        );

        res.status(200).json(allCarts);
    } catch (err) {
        console.error("Error in all-carts:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.delete("/cancel-cart", async (req, res) => {
    try {
        const signedValue = req.cookies?.is_auth || "";
        const gmail = verifySignedValue(signedValue);

        if (!gmail) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const { title, pts, daysLeft } = req.body;
        if (!title || typeof pts !== "number" || typeof daysLeft !== "number") {
            return res.status(400).json({ error: "Missing or invalid cart data" });
        }

        const user = await ps.findOne({ gmail });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const itemIndex = user.cart.findIndex(item => 
            item.title === title && 
            item.pts === pts && 
            item.daysLeft === daysLeft
        );

        if (itemIndex === -1) {
            return res.status(404).json({ error: "Cart item not found" });
        }

        const marketplaceItem = await MarketplaceItem.findOne({ title });
        if (marketplaceItem) {
            marketplaceItem.stock += 1;
            await marketplaceItem.save();
        }

        user.points += pts;
        
        user.cart.splice(itemIndex, 1);
        await user.save();

        res.status(200).json({ 
            message: "Order cancelled successfully",
            refundedPoints: pts,
            totalPoints: user.points
        });
    } catch (err) {
        console.error("Error in cancel-cart:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
