var options={
	host: "asev.l3s.uni-hannover.de",
	port: "1987",
	core: "collection1",
	path: "/solr/"
};
//http://asev.l3s.uni-hannover.de:1987/solr/
var solr = require('solr-client');
var client = solr.createClient(options);

var _ = require('underscore');

var freebase=require('freebase');
var when=require('when');

exports.search = function(req, res){
  res.render('search' ,{results:[], query:""});
};

//{fl : 'body', pre: '<strong>', post: '</strong>', requireFieldMatch: true, usePhraseHighlighter: true}
exports.searchQuery = function(req, res){

	var query =req.query.q;

	var query2 = client.createQuery()
						   .q({body : query})
						   .set('hl.fl=body')
						   .set('hl=true')
						   .set('hl.simple.pre='+encodeURIComponent("<strong>"))
						   .set('hl.simple.post='+encodeURIComponent("</strong>"))
						   .set('hl.requireFieldMatch=true')
						   .set('hl.usePhraseHighlighter=true')
						   .start(0)
						   .rows(40);
	var todo=[
		search(query2,true),
		freebaseSearch(query)
	]
	when.all(todo).done(function(value){
		console.log("done");
		var searchRes= value[0].search;
		var freebaseRes= value[1].freebase;
		if(searchRes.timelineObject)
		{
			searchRes.timelineObject.timeline.headline=query;
			searchRes.timelineObject.timeline.text=freebaseRes;
			res.render('search',{results: searchRes.results, query:query, error:"", size: searchRes.size, timelineObject: JSON.stringify(searchRes.timelineObject)});
		}
		else
		{
			res.render('search',{results: searchRes.results, query:query, error:"", size: searchRes.size});
		}	
	});
};

//{fl : 'body', pre: '<strong>', post: '</strong>', requireFieldMatch: true, usePhraseHighlighter: true}
exports.searchQueryGrid = function(req, res){

	var query =req.query.q;

	if(!query)
	{
		res.render('searchGrid' ,{results:[], query:""});
	}

	var query2 = client.createQuery()
						   .q({body : query})
						   .set('hl.fl=body')
						   .set('hl=true')
						   .set('hl.simple.pre='+encodeURIComponent("<strong>"))
						   .set('hl.simple.post='+encodeURIComponent("</strong>"))
						   .set('hl.requireFieldMatch=true')
						   .set('hl.usePhraseHighlighter=true')
						   .start(0)
						   .rows(40);
	var todo=[
		search(query2,false)
	]
	when.all(todo).done(function(value){
		console.log("done");
		var searchRes= value[0].search;
		res.render('searchGrid',{results: searchRes.results, query:query, error:"", size: searchRes.size});
	});
};

exports.fetchDoc= function(req,res){
	var query = client.createQuery()
						   .q({id : req.params.id})
						   .start(0)
						   .rows(1);
	var todo=[
		search(query,false)
	]

	when.all(todo).done(function(value){
		console.log("done");
		var searchRes= value[0].search;
		if(searchRes.results[0])
		{
			res.header(200);
			res.send(searchRes.results[0]);
		}
		else
		{
			res.header(404);
			res.send(JSON.stringify({}))
		}	
	});
}

var search=function(query2,timelineNeeded)
{
	var results=[];
	var sizeOfResultSet=0;
	console.log("search started");
	var deffered = when.defer();
	client.search(query2,function(err,obj){
   if(err){
   	console.log(err);
   	deffered.resolve({search:{results: results,size: sizeOfResultSet, error:"Error querying Solr"} });
   }
   else{	
   	
   	if(false)
   	{
   		obj=includeHighlighting(obj);
   	}
   	results = obj.response.docs;
   	sizeOfResultSet = obj.response.numFound;
   	if(sizeOfResultSet>0 && timelineNeeded)
   	{
   		var timeline = createTimelineJSON(results);
   		console.log(timeline);
   		deffered.resolve({search:{results: results, error:"" ,size: sizeOfResultSet, timelineObject: timeline}});
   	} 
   	else
   	{
   		deffered.resolve({search:{results: results,size: sizeOfResultSet, error:""}});
   	}
   }
	});
	return deffered.promise;
}

function includeHighlighting(object){

	for(var i=0; i<object.response.docs.length; i++)
	{
		object.response.docs[i].body=object.highlighting[i].body;
	}
	return object;
}

var freebaseSearch=function(query)
{
	console.log("freebase querying");
	var deffered = when.defer();
	freebase.description(query, {}, function(body){
		console.log(body);
		deffered.resolve({freebase: body});
	});
	return deffered.promise;
}
  
function createTimelineJSON(docs){
	var Timeline = function(){
		this.headline= "Test"
		this.type= "default"
		this.text= "People say stuff"
	};
	var entry = function(start, end, title, desc , tag){
		this.startDate=start
		this.endDate=end
    this.headline=title
    this.text=desc
    this.tag= tag
	}
	var tp = new Timeline();
	var results = [];
	for (var i=0;i<docs.length;i++)
	{ 
		results[i] = new entry(docs[i].publicationYear+","+docs[i].publicationMonth+","+docs[i].publicationDayOfMonth,
					             docs[i].publicationYear+","+docs[i].publicationMonth+","+docs[i].publicationDayOfMonth,
					             docs[i].headline,
					           	 docs[i].body,  
					           	 docs[i].newsDesk  
										)
	}



	tp.date= results;

	var returnObj={
		timeline: tp
	}
	return returnObj;
}