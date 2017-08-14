exports.get = function(req, res) {
	res.render('doc');
	console.log("id: "+req.session.user);
};