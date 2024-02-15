exports.checkAuth = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        const res = await fetch('http://localhost:5000/api/v1/adsm/autnN/getUserDetials', {
            headers: { authorization },
            method: 'GET'
        });

        const response = await res.json();
        if (response.status === 'SUCCESS') req.user = response.user;
        else req.user = {}

        next();
    } catch (e) {
        console.log(e);
        req.user = {};
        next();
    }
}