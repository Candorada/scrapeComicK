const puppeteer = require('puppeteer');
const express = require('express');
var app = express();
async function search(time,limit,page,genres=[],tags=[],minChap,sort,showall=false,q="",altTitle=false){
try{
    var obj = {time,limit,page,genres,tags,sort,minChap,showall,q,altTitle}
    var txt = []
    // https://api.comick.io/v1.0/search/?genres=genre1,genre2&type=comic&tags=tag1,tag2&page=1&limit=15&minimum=99&sort=rating&showall=false&q=search%20value&t=false
    Object.keys(obj).forEach(key=>{
        if(Array.isArray(obj[key])){
            txt.push(`${key}=${obj[key].join(",")}`)
        }else if(obj[key]){
            txt.push(`${key}=${obj[key]}`)
        }
    })
    window = await puppeteer.launch({headless:true})
    wPage = await window.newPage()
    await wPage.setUserAgent('Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0')
    await wPage.goto("https://api.comick.io/v1.0/search?"+txt.join("&"))
    var ct = await (wPage.evaluate(()=>document.body.innerText))
    //await wPage.waitForSelector("pre")
    await window.close()
    return JSON.parse(await ct)
}catch{
    return []
}
}
async function imgs(hid){
    window = await puppeteer.launch({headless:true})
    wPage = await window.newPage()
    await wPage.setUserAgent('Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0')
    await wPage.setExtraHTTPHeaders({
        'Referer': 'https://comick.io',
        "accept": "application/json"
        // You can add more headers if needed
        // 'Custom-Header': 'value',
      });
    await wPage.goto(`https://api.comick.io/chapter/${hid}/get_images`)
    var ct = await (wPage.evaluate(()=>document.body.innerText))
    await window.close()
    return JSON.parse(await ct)
}
async function about(slug){
    window = await puppeteer.launch({headless:true})
    wPage = await window.newPage()
    await wPage.setUserAgent('Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0')
    await wPage.setExtraHTTPHeaders({
        'Referer': 'https://comick.io/comic/'+slug,
        // You can add more headers if needed
        // 'Custom-Header': 'value',
      });
    await wPage.goto("https://api.comick.io/comic/"+slug)
    var ct = await (wPage.evaluate(()=>document.body.innerText))
    await window.close()
    return JSON.parse(await ct)
}
async function chapters(hid){
    window = await puppeteer.launch({headless:true})
    wPage = await window.newPage()
    await wPage.setUserAgent('Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0')
    await wPage.setExtraHTTPHeaders({
        'Referer': 'https://comick.io',
        // You can add more headers if needed
        // 'Custom-Header': 'value',
      });
    await wPage.goto("https://api.comick.io/comic/"+hid+"/chapters?limit=9999999")
    var ct = await (wPage.evaluate(()=>document.body.innerText))
    await window.close()
    return JSON.parse(await ct)
}
app.get('/search?', async (r, res) => {
    req = r.query
    ct = await search(time = req.time,limit = req.limit,page=req.page,genres=(req.genres?req.genres.split(","):null),tags = (req.tags?req.tags.split(","):null),minChap = req.minimum,sort = req.sort,showall=req.showall,q=req.q,altTitle=req.t)
    res.send(await ct);
});
app.get('/comic/:slug/about', async (req, res) => {
    ct = await about(req.params.slug)//req.slug)
    res.send(await ct);
});
app.get('/comic/chapter/:hid', async (req, res) => {
    ct = await imgs(req.params.hid)
    res.send(await ct);
})
app.get('/comic/:hid/chapters', async (req, res) => {
    try{
        ct = await chapters(req.params.hid)
        res.send(await ct);
    }catch{
        res.send([])
    }

});
app.get("/site/search?",async (req, res)=>{
    var p = []
    for(var x in req.query){
        p.push(x+"="+req.query[x])
    }
    var url = `${req.protocol}://${req.hostname}:${port}`+"/search"+(p.length?"?":"")+p.join("&")
    console.log(url)
    var d = await fetch(url)
    var text = await await d.text()
    console.log(await text)
    res.send(await JSON.parse(await text))
})

const port = 5555;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});