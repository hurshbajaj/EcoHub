const express = require("express");
let cp = require("cookie-parser");
const path = require("path");
const mongoose = require("mongoose");
const api_router = require("./api.js");

const dotenv = require("dotenv");
dotenv.config();
const crypto = require("crypto");

function is_auth(req, res, nxt) {
    const cookieVal = req.cookies.is_auth;
    if (!cookieVal) return res.redirect(`/SignUp`);

    try {
        const [data, signature] = cookieVal.split("|");

        if (!data || !signature) return res.redirect(`/SignUp`);

        const expectedSig = crypto
            .createHmac("sha256", process.env.SECRET)
            .update(data)
            .digest("hex");

        if (crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSig, "hex"))) {
            nxt();
        } else {
            res.redirect(`/SignUp`);
        }
    } catch (err) {
        res.redirect(`/SignUp`);
    }
}

module.exports = {is_auth};