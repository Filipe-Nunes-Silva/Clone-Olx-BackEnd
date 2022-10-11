const { Category } = require('../models/Category');
const { User } = require('../models/User');
const { Ad } = require('../models/Ad');
const { State } = require('../models/State');
//Mongoose
const {isValidObjectId} = require('mongoose');
//Modules
const { v4: uuid } = require('uuid');
const jimp = require('jimp');

const addImage = async (buffer) => {
    let newName = `${uuid()}.jpg`;
    let tmpImg = await jimp.read(buffer);
    tmpImg.cover(500, 500).quality(80).write(`./public/media/${newName}`);
    return newName;
};

const updateMoneyToFloat = (money) =>{
    if(money){
        let moneyFloat = money.replace('.', '')
        .replace(',', '.')
        .replace('R$ ', '');
        return parseFloat(moneyFloat);
    }
    else{
        return 0;
    };
    
};


class AdsController {

    static async getCategories(req, res) {
        const cats = await Category.find().lean();
        const categories = [];
        for (let i in cats) {
            categories.push({
                ...cats[i],
                img: `${process.env.BASE}/assets/images/${cats[i].slug}.png`,
            });
        };
        res.json({ categories });
    };

    static async addAction(req, res) {
        let { title, price, priceneg, desc, cat, token } = req.body;
        const user = await User.findOne({ token });

        if (!title || !cat) {
            res.json({ error: 'Titulo e/ou Categoria são obrigatorios!' });
            return;
        };

        if(!isValidObjectId(cat)){
            res.json({ error: 'ID de categoria inválido!' });
            return;
        };

        const category = await Category.findById(cat);
        if(!category){
            res.json({ error: 'Categoria inexistente!' });
            return;
        };

        if (price) { // Transformar assim R$ 8.000,35 para 8000.35
            price = updateMoneyToFloat(price);
        };

        const newAd = new Ad();
        newAd.status = true;
        newAd.idUser = user._id;
        newAd.state = user.state;
        newAd.dateCreated = new Date();
        newAd.title = title;
        newAd.category = cat;
        newAd.price = price;
        newAd.priceNegotiable = (priceneg == 'true') ? true : false;
        newAd.description = desc;
        newAd.views = 0;

        if (req.files && req.files.img) {
            if (req.files.img.length == undefined) {
                if (['image/jpg', 'image/jpeg', 'image/png'].includes(req.files.img.mimetype)) {
                    let url = await addImage(req.files.img.data);
                    newAd.images.push({ url, default: false });
                };
            }
            else {
                for (let i = 0; i < req.files.img.length; i++) {
                    if (['image/jpg', 'image/jpeg', 'image/png'].includes(req.files.img[i].mimetype)) {
                        let url = await addImage(req.files.img[i].data);
                        newAd.images.push({ url, default: false });
                    };
                };
            };
        };
        if (newAd.images.length > 0) {
            newAd.images[0].default = true;
        };

        const info = await newAd.save();
        res.json({ id: info._id });
    };

    static async getList(req, res) {
        let { sort = 'asc', offset = 0, limit = 8, q, cat , state } = req.query;
        let filters = { status: true };
        let total = 0;

        //Filtros
        if (q) {
            filters.title = { '$regex': q, '$options': 'i' }
        };
        if (cat) {
            const categ = await Category.findOne({ slug: cat });
            if (categ) {
                filters.category = categ._id.toString();
            };
        };
        if (state) {
            const getStates = await State.findOne({ name: state.toUpperCase() });
            if (getStates) {
                filters.state = getStates._id.toString();
            };
        };

        const adsTotal = await Ad.find(filters);
        total = adsTotal.length;

        const adsData = await Ad.find(filters)
            .sort({ dateCreated: (sort == 'desc' ? -1 : 1) })
            .skip(parseInt(offset))
            .limit(parseInt(limit));

        let ads = [];

        for (let i in adsData) {

            let image;
            let defaultImg = adsData[i].images.find(img => img.default);
            if (defaultImg) {
                image = `${process.env.BASE}/media/${defaultImg.url}`;
            }
            else {
                image = `${process.env.BASE}/media/default.jpg`;
            };

            ads.push({
                id: adsData[i]._id,
                title: adsData[i].title,
                price: adsData[i].price,
                priceNegotiable: adsData[i].priceNegotiable,
                image
            });
        };
        res.json({ ads, total });
    };

    static async getItem(req, res) {
        let { id, other = null } = req.query;

        if (!id) {
            res.json({ error: 'Sem produto!' });
            return;
        };
        if (!isValidObjectId(id)) {
            res.json({ error: 'ID inválido!' });
            return;
        };

        const ad = await Ad.findById(id);
        if (!ad) {
            res.json({ error: 'Produto inexistente!' });
            return;
        };

        ad.views++;
        await ad.save();

        let images = [];
        for (let i in ad.images) {
            images.push(`${process.env.BASE}/media/${ad.images[i].url}`);
        };
        
        let category = await Category.findById(ad.category);
        let userInfo = await User.findById(ad.idUser);
        let stateInfo = await State.findById(ad.state);

        let others = [];
        
        if (other === 'true') {
            const otherData = await Ad.find({ status: true, idUser: ad.idUser });
            for(let i in otherData){
                if(otherData[i]._id.toString() != ad._id.toString()){

                    let image = `${process.env.BASE}/media/default.jpg`;
                    let defaultImg = otherData[i].images.find(img => img.default);
                    if(defaultImg){
                        image = `${process.env.BASE}/media/${defaultImg.url}`;
                    };

                    others.push({
                        id: otherData[i]._id,
                        title: otherData[i].title,
                        price: otherData[i].price,
                        priceNegotiable:otherData[i].priceNegotiable,
                        image,
                    });

                };
            };
        };

        res.json({
            id: ad._id,
            title: ad.title,
            price: ad.price,
            priceNegotiable: ad.priceNegotiable,
            description: ad.description,
            dateCreated: ad.dateCreated,
            views: ad.views,
            images,
            category,
            userInfo: {
                name:userInfo.name,
                email:userInfo.email,
            },
            stateInfo: stateInfo.name,
            others,
        });
    };

    static async editAction(req, res) {
        let { id } = req.params;
        let { title, status, price, priceneg, desc, cat, images, token } = req.body;


        if (!isValidObjectId(id)) {
            res.json({ error: 'ID inválido!' });
            return;
        };

        const ad = await Ad.findById(id);
        if (!ad) {
            res.json({ error: 'Anúncio inexistente!' });
        };

        const user = await User.findOne({ token });

        if (user._id.toString() !== ad.idUser) {
            res.json({ error: 'Anúncio não pertence a esta conta!' });
            return;
        };

        let updates = {};

        if (title) {
            updates.title = title;
        };
        if (price) {
            updates.price = updateMoneyToFloat(price);
        };
        if (priceneg) {
            updates.priceNegotiable = priceneg;
        };
        if (status) {
            updates.status = status;
        };
        if (desc) {
            updates.description = desc;
        };
        if (cat) {
            const category = await Category.findOne({ slug: cat });
            if (!category) {
                res.json({ error: 'Categoria inexistente!' });
                return;
            };
            updates.category = category._id.toString();
        };
        if (images) {
            updates.images = images;
        };

        await Ad.findByIdAndUpdate(id, { $set: updates });

        if(req.files && req.files.img) {
            const adI = await Ad.findById(id);

            if(req.files.img.length == undefined) {
                if(['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img.mimetype)) {
                    let url = await addImage(req.files.img.data);
                    adI.images.push({
                        url,
                        default: true
                    });
                };
            } 
            else {
                for(let i=0; i < req.files.img.length; i++) {
                    if(['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img[i].mimetype)) {
                        let url = await addImage(req.files.img[i].data);
                        adI.images.push({
                            url,
                            default: true
                        });
                    };
                };
            };

            adI.images = [...adI.images];
            await adI.save();
        };

        res.json({error:'',update:true});
    };

};

module.exports = {
    AdsController
};