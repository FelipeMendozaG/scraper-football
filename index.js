import express from "express";
import dotenv from "dotenv"
import puppeteer from "puppeteer";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4008;
app.listen(PORT,()=>{
    console.log("app corriendo en : http://localhost:"+PORT);
});

async function openWebPage() {
    const browser = await puppeteer.launch({
      headless: false,
      slowMo: 300,
    });
    const page = await browser.newPage();
    await page.goto("https://footballia.net/users/sign_in");
    await page.click('button.btn-close.btn.btn-base');
    const user_email = await page.$("input#user_email");
    await user_email.click();
    await user_email.type('felipe188.mendoza@gmail.com');
    const user_password = await page.$("input#user_password");
    // await user_email.type(String.fromCharCode(13));
    await user_email.click();
    await user_password.type('chepita123789');
    // await browser.close();
}
  
openWebPage();