
var request= require('request');

require('date-utils');

var today = Date.today();

function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}

exports.index = function(req, res){
	
	var city= req.params.city;
	var options = {
		url: 'http://api.openweathermap.org/data/2.5/find?units=metric&mode=json&q='+city
	};
	var weather;
	var location;
	var image;
	var weatherCall=request(options, function (error, response, body){
		if (!error && response.statusCode == 200)
		{
			console.log(body);
			var bodyObj=JSON.parse(body);
			weather= bodyObj.list[0].main;
			location= bodyObj.list[0].name;
			var imageCall=request('http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=eeb19832e6384d2de9f97d817763d0fd&text=scenic+'+city+'&sort=interestingness-desc&per_page=1&page=1&format=json&nojsoncallback=1', function (error, response, body){
				if (!error && response.statusCode == 200)
				{
					console.log(body);
					var flickrURL='http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_b.jpg';
					var image=JSON.parse(body).photos.photo[0];
					flickrURL= replaceAll("{farm-id}",image.farm, flickrURL);
					flickrURL= replaceAll("{server-id}",image.server, flickrURL);
					flickrURL= replaceAll("{id}",image.id,flickrURL);
					flickrURL= replaceAll("{secret}",image.secret,flickrURL);
					console.log('ok!!');
					res.render('index', { weather: weather, location: location, date: today, imageURL: flickrURL });
				}
				else
				{
					console.log('img error')
				}
	})
			// Print the google web page.
		}
		else
		{
			console.log('weatehr error');
		}
	})
	
}