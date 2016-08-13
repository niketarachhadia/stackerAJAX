// this function takes the question object returned by the StackOverflow request
// and returns new result to be appended to DOM
var showQuestion = function(question) {
	
	// clone our result template code
	var result = $('.templates .question').clone();
	
	// Set the question properties in result
	var questionElem = result.find('.question-text a');
	questionElem.attr('href', question.link);
	questionElem.text(question.title);

	// set the date asked property in result
	var asked = result.find('.asked-date');
	var date = new Date(1000*question.creation_date);
	asked.text(date.toString());

	// set the .viewed for question property in result
	var viewed = result.find('.viewed');
	viewed.text(question.view_count);

	// set some properties related to asker
	var asker = result.find('.asker');
	asker.html('<p>Name: <a target="_blank" '+
		'href=http://stackoverflow.com/users/' + question.owner.user_id + ' >' +
		question.owner.display_name +
		'</a></p>' +
		'<p>Reputation: ' + question.owner.reputation + '</p>'
	);

	return result;
};

var showAnswerer = function(answerer){
	var result = $('.templates .answerer').clone();
	var answererName = result.find('.answerer-name a');
	answererName.attr('href', answerer.user.link);
	answererName.text(answerer.user.display_name);

	var  count = result.find('.post-count');
	count.text(answerer.post_count);

	var  score = result.find('.score');
	score.text(answerer.score);

	var  reputation = result.find('.reputation');
	reputation.text(answerer.user.reputation);

	return result;
};

var showSearchResults = function(query, resultNum) {
	var results = resultNum + ' results for <strong>' + query + '</strong>';
	return results;
};

var showError = function(error){
	var errorElem = $('.templates .error').clone();
	var errorText = '<p>' + error + '</p>';
	errorElem.append(errorText);
};

var getTopAnswerers = function(tag){
	var request = {
		site : 'stackoverflow',
	};
	$.ajax({
		url: "http://api.stackexchange.com/2.2/tags/"+tag+"/top-answerers/month",
		data : request,
		dataType : 'jsonp',
		type : 'GET'

	}).done(function(result){
		var searchResults = showSearchResults(tag,result.items.length);
		console.log(searchResults);
		console.log(result.items);
		$('.search-results').html(searchResults);
		$.each(result.items, function(i, item) {
			var answerer = showAnswerer(item);
			$('.results').append(answerer);
		});
	}).fail(function(jqXHR,error){
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
};

var getUnanswered = function(tags) {

	var request = { 
		tagged: tags,
		site: 'stackoverflow',
		order: 'desc',
		sort: 'creation'
	};
	
	$.ajax({
		url: "http://api.stackexchange.com/2.2/questions/unanswered",
		data: request,
		dataType: "jsonp",
		type: "GET",
	})
	.done(function(result){ //this waits for the ajax to return with a succesful promise object
		var searchResults = showSearchResults(request.tagged, result.items.length);

		$('.search-results').html(searchResults);
		$.each(result.items, function(i, item) {
			var question = showQuestion(item);
			$('.results').append(question);
		});
	})
	.fail(function(jqXHR, error){ //this waits for the ajax to return with an error promise object
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
};


$(document).ready( function() {
	$('.unanswered-getter').submit( function(e){
		e.preventDefault();
		// zero out results if previous search has run
		$('.results').html('');
		// get the value of the tags the user submitted
		var tags = $(this).find("input[name='tags']").val();
		getUnanswered(tags);
		});
	$('.inspiration-getter').submit( function(e){
		e.preventDefault();
		// zero out results if previous search has run
		$('.results').html('');
		// get the value of the tags the user submitted
		// var tags = $(this).find("input[name='tags']").val();
		// getUnanswered(tags);
		var tag = $(this).find("input[name='answerers']").val();
		getTopAnswerers(tag);
	});

});
