import express from "express";
import dotenv from "dotenv"
import puppeteer from "puppeteer";
import mongoose, { Schema, SchemaType, mongo } from "mongoose";
dotenv.config();
var data = [
  {
    "_id": {
      "$oid": "64840c0e1ebdd09a3ba7da6f"
    },
    "date": {
      "$date": "2023-05-16T05:00:00.000Z"
    },
    "competition": "Champions League",
    "season": "2022-2023",
    "stage": "Semi-final, 2nd leg",
    "title_match": "FC Internazionale vs. AC Milan",
    "path_video": "https://footballia.net/matches/fc-internazionale-ac-milan-champions-league-2022-2023",
    "createdAt": {
      "$date": "2023-06-10T05:37:18.801Z"
    },
    "updatedAt": {
      "$date": "2023-06-10T05:37:18.801Z"
    }
  },
  {
    "_id": {
      "$oid": "64840c0e1ebdd09a3ba7da71"
    },
    "date": {
      "$date": "2023-05-17T05:00:00.000Z"
    },
    "competition": "Champions League",
    "season": "2022-2023",
    "stage": "Semi-final, 2nd leg",
    "title_match": "Manchester City vs. Real Madrid",
    "path_video": "https://footballia.net/matches/manchester-city-real-madrid-champions-league-2022-2023",
    "createdAt": {
      "$date": "2023-06-10T05:37:18.802Z"
    },
    "updatedAt": {
      "$date": "2023-06-10T05:37:18.802Z"
    }
  }];
const dbConnect = ()=>{
  const DB_URI = process.env.DB_URI;
  mongoose.connect(DB_URI,{
      useNewUrlParser:true,
      useUnifiedTopology:true,
  },
  (err,res)=>{
      if(!err){
          console.log('** CONEXION CORRECTA***')
      }else{
          console.log('*** ERROR DE CONEXION ** ')
      }
  })
}
// MODELO
const MatchesScheme = new mongoose.Schema(
  {
      date:{
          type:Date
      },
      competition:{
          type:String
      },
      season:{
          type:String
      },
      stage:{
          type:String
      },
      title_match:{
          type:String
      },
      path_video:{
          type:String
      }
  },
  {
      // MARCAS DE TIEMPO
      timestamps:true,
      versionKey:false
  }
);
//
const ModelMatches = mongoose.model('matches',MatchesScheme)
const PlayerSchema = new mongoose.Schema(
  {
    name:{
      type:String
    },
    dorsal:{
      type:String
    },
    nationality:{
      type:String
    },
    is_titular:{
      type:Boolean
    }
  },
  {
      // MARCAS DE TIEMPO
      timestamps:true,
      versionKey:false
  }
);
const ModelPlayer = mongoose.model('player',PlayerSchema)
const MatchGoal = new mongoose.Schema(
  {
    match:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'matches'
    },
  },
  {
    // MARCAS DE TIEMPO
    timestamps:true,
    versionKey:false
  }
)
const ModelMatchGoal = mongoose.model('match_goals',MatchGoal)

const MatchDetailSchema = new mongoose.Schema(
  {
    title:{
      type:String,
    },
    match:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'matches'
    },
    language:{
      type:String
    },
    // coach:{
    //  type:String
    // },
    //result:{
    //  type:String
    //},
    url_video:{
      type:String
    }//,
    //players:[PlayerSchema]
  },
  {
    // MARCAS DE TIEMPO
    timestamps:true,
    versionKey:false
  }
);
const ModelMatchDetail = mongoose.model('match_details',MatchDetailSchema)
//
const app = express();
const PORT = process.env.PORT || 4008;
app.listen(PORT,()=>{
    console.log("app corriendo en : http://localhost:"+PORT);
});

dbConnect();

async function openWebPage(model) {
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
    // CANTIDAD DE PAGINAS
    let lastpage = await page.evaluate(()=>{
      let li = document.querySelector("ul.pagination.pagination").children
      return parseInt(li[li.length-2].textContent);
    });
    for(let i = 1; i<=lastpage; i++){
      await page.goto(`https://footballia.net/competitions/champions-league?page=${i}`);
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
              competition:item.children[2].innerHTML,
              season:item.children[4].innerHTML,
              stage:item.children[3].innerHTML,
              title_match:(item.children)[1].children[1].children[0].text,
              path_video:(item.children)[1].children[1].children[0].href
            }
          );
        }
        return listdata;
      });
      for(let row of jsondata){
        await model.create(row);
      }
    }
    // BUTON
}

async function openDetailWeb(model,modelDetail){
 
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();
  await page.goto("https://footballia.net/users/sign_in",{timeout:60000});
  await page.click('button.btn-close.btn.btn-base');
  await page.evaluate(()=>{
    //
    document.querySelector("#user_email").value = 'felipe188.mendoza@gmail.com';
    document.querySelector("#user_password").value = 'chepita123789';
    //
    const submitButton = document.querySelector('input[type="submit"]');
    submitButton.click();
    
  });
  await page.waitForNavigation({timeout:80000});
  let list = data;
  console.log(list.length);
  for(let item of list){
    console.log(item._id.$oid)
    //console.log(item.path_video);
    await page.goto(`${item.path_video}`,{timeout:80000});
    let detail = await page.evaluate(()=>{
      document.querySelector('div#jwplayer_display_button').click()
      let srcvideo = document.querySelector("video").getAttribute('src');
      let lang = document.querySelector('span.language').textContent;
      return {"url_video":srcvideo,"language":lang};
    });
    ModelMatches.findOne({_id:item._id.$oid})
    .then((mymatch)=>{
      detail = {...detail,title:item.title_match,match:mymatch._id};
      console.log(detail);
      const newDetail = new ModelMatchDetail({
        url_video:detail.url_video,
        title:detail.title,
        match:mymatch._id,
        language:detail.language
      })
      return newDetail.save();
    })
  }
}
openDetailWeb(ModelMatches,ModelMatchDetail);
// openWebPage(ModelMatches);