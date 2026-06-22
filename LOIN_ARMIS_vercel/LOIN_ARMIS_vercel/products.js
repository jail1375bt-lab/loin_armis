/* ===========================================================
   LOIN ARMIS 商品データ（ここだけ編集すれば全ページに反映）
   - 追加：オブジェクトを足す（id=並び順で自動）
   - 価格：p（表示用 "¥25,000"）と price（数値）両方を合わせる
   - SOLD OUT：sold:1 を付ける（購入不可・中央にSOLD OUT表示）
   - 画像：imgs に同フォルダのファイル名（複数可、先頭がメイン）
   - サイズ：tops/bottoms は S/M/L/XL、acc は FREE（既定）。
            個別指定したい時だけ sizes / chart を書く
   =========================================================== */
(function(){
  var PRODUCTS=[
    {n:"Mesh layer long sleeve tee",p:"¥25,000",price:25000,cat:"tops",desc:"DISTRESSED MESH LAYER OVER PRINTED TEE, \"NOW LIGHTS THE FUTURE\" FRONT PRINT, RAW FRAYED HEM / 100% COTTON",imgs:["mesh-1.jpg","mesh-2.jpg","mesh-3.jpg"],sizes:["1","2"],chart:{head:["SIZE","Length","Shoulder","Body width","Sleeve"],rows:[["1",58,62,70,60],["2",60,64,72,62]]},features:["Damage processing","Wash processing","Vintage silk screen print","Layered damage cotton mesh","The mesh can be removed from the sleeves and torso to use as a stole (Transform)"]},
    {n:"Cross zip layer mesh coating jeans",p:"¥40,000",price:40000,cat:"bottoms",desc:"COATED RIGID DENIM, CROSS ZIP, MESH LAYER PANEL / 100% COTTON",imgs:["jeans-1.jpg","jeans-2.jpg","jeans-3.jpg","jeans-4.jpg","jeans-5.jpg"]},
    {n:"3way many pocket cargo sweat pants",p:"¥50,000",price:50000,cat:"bottoms",desc:"MULTI POCKET, 3-WAY CONVERTIBLE SWEAT / COTTON BLEND",imgs:["cargo-1.jpg"]},
    {n:"Abandoned Repair baggy jeans",p:"¥33,000",price:33000,cat:"bottoms",desc:"REPAIRED BAGGY DENIM, OIL WASH / 100% COTTON",imgs:["baggy-1.jpg"]},
    {n:"After the war cap",p:"¥18,000",price:18000,sold:1,cat:"acc",desc:"DISTRESSED 6-PANEL CAP / ADJUSTABLE",imgs:["afterwar-1.jpg"]},
    {n:"Hooded ombre check shirt jacket",p:"¥33,000",price:33000,cat:"tops",desc:"OMBRE CHECK FLANNEL, HOODED / 100% COTTON",imgs:["jacket-1.jpg"]},
    {n:"LAS co. cap",p:"¥18,000",price:18000,cat:"acc",desc:"6-PANEL TWILL CAP, EMBROIDERED LOGO / ADJUSTABLE",imgs:["lascap-1.jpg"]},
    {n:"LAS dark side moon carabiner",p:"¥4,000",price:4000,cat:"acc",desc:"METAL CARABINER CHARM",imgs:["carabiner-1.jpg"]},
    {n:'"Poetry of life" thermal raglan long sleeve t-shirt',p:"¥22,000",price:22000,sold:1,cat:"tops",desc:"WAFFLE THERMAL, RAGLAN SLEEVE / 100% COTTON",imgs:["poetry-1.jpg"]},
    {n:"Split zipper double calf leather belt",p:"¥20,000",price:20000,cat:"acc",desc:"DOUBLE CALF LEATHER, SPLIT ZIP / MADE IN JAPAN",imgs:["belt-1.jpg"]}
  ];
  if(typeof window!=='undefined') window.PRODUCTS=PRODUCTS;
  if(typeof module!=='undefined') module.exports=PRODUCTS;
})();
