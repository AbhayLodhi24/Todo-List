//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

const itemsSchema = new mongoose.Schema({
  name : String 
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name : "Buy Food"
} );

const item2 = new Item({
  name : "Cook Food"
});

const item3 = new Item({
  name: "Eat Food"
});

const defaultItems = [item1 , item2 , item3] ;

const listSchema = new mongoose.Schema({
  name: String,
  items : [itemsSchema]
});

const List = mongoose.model("List" , listSchema);

app.get("/", function(req, res) {

Item.find({}).then(function(fountItems){
  if(fountItems.length == 0)
  {
    Item.insertMany(defaultItems).then(function(){
  console.log("Items Successfully inserted on your database");
  res.redirect("/");
}).catch(function(err){
  console.log(err);
});
  }
  else{
    res.render("list", {listTitle: "Today", newListItems: fountItems});
  } 
}).catch(function(err){
  console.log(err);
})


});

app.post("/", function(req, res){

  const itemName = req.body.newItem ;
  const listName = req.body.list;

  const item = new Item({
    name : itemName 
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}).then((fountList)=>{
      fountList.items.push(item);
      fountList.save();
      res.redirect("/"+listName);
    });
  }
});

app.post("/delete", function(req , res){
    const checkedItemId = req.body.checkbox ;
    const listName = req.body.listName;

    if(listName === "Today")
    {
      Item.findByIdAndRemove(checkedItemId).then(function(){
            console.log("Item deleted successfully from the DB");
            res.redirect("/");
          }).catch((err)=>{
            console.log(err) ;
          });
    }
    else
    {
      List.findOneAndUpdate({name: listName},{$pull:{items :{_id : checkedItemId}}}).then(()=>{
        
          res.redirect("/"+listName);
      });
    }
   
});

app.get("/:customListName" , function(req , res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name : customListName}).then((fountList)=>{
    res.render("list", {listTitle: fountList.name, newListItems: fountList.items});
  }).catch((err, fountList)=>{ 
    if(!err){
      if(!fountList){
        const list = new List({
          name : customListName,
          items : defaultItems
        });
          list.save();
          res.redirect("/"+ customListName);
      }
    }
  })

  const list = new List({
    name: customListName,
    items: defaultItems 
  });

  list.save();

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
