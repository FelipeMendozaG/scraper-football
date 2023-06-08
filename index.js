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
      slowMo: 100,
    });
    const page = await browser.newPage();
    await page.goto("https://footballia.net/users/sign_in");
    await page.click('button.btn-close.btn.btn-base');
    await page.evaluate(()=>{
      //
      document.querySelector("#user_email").value = 'felipe188.mendoza@gmail.com';
      document.querySelector("#user_password").value = 'chepita123789';
      //
      const submitButton = document.querySelector('input[type="submit"]');
      submitButton.click();
      
    });
    await page.waitForNavigation();
    await page.goto('https://footballia.net/competitions/champions-league');
    // OBTENEMOS LA INFORMACION DE LA TABLA
    let jsondata = await page.evaluate(()=>{
      let tableList = document.querySelector("table.table.table-striped > tbody").children;
      let listdata = [];
      for(let item of tableList){
        let date = new Date((item.children[0]).innerHTML);
        const fechaFormateada = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        listdata.push(
          {
            date:fechaFormateada, 
            competion:item.children[2].innerHTML,
            season:item.children[4].innerHTML,
            stage:item.children[3].innerHTML,
            title_match:(item.children)[1].children[1].children[0].text,
            path_video:(item.children)[1].children[1].children[0].href
          }
        );
      }
      return listdata;
    });
    console.log(jsondata);
    // BUTON
}
  
openWebPage();