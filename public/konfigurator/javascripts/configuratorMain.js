if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}

var context = {
    // url: 'Measuring transducers MT 4xx',
    url: "buzzWord",
    // url: document.getElementsByClassName("productItemTittle")[0].innerHTML,
    language: document.documentElement.lang,
    dataPath: '/konfigurator/'
}

var dm = (function (context) {

    var context = context;
    var storedProducts = [];

    var loadData = function (url, target, callback) {
        $.ajax({
            url: url,
            method: 'GET',
            success: function (data) {
                // loadSuccess(JSON.parse(data), target, callback);
                callback(JSON.parse(data));
            },
            error: function () {
                callback();
            }
        });
    }
    var storeProduct = function (product) {
        var alreadyStored = false;
        for (let i = 0; i < storedProducts.length; i++) {
            if (product.id === storedProducts[i].id) {
                storedProducts[i] = product; alreadyStored = true;
            }
        }
        if (!alreadyStored) { storedProducts.push(product); }
    }
    var getStoredProduct = function (id) {
        for (let i = 0; i < storedProducts.length; i++) {
            if (id === storedProducts[i].id) {
                return storedProducts[i];
            }
        }
        return false;
    }
    var deleteStoredProduct = function (id) {
        for (let i = 0; i < storedProducts.length; i++) {
            if (id === storedProducts[i].id) {
                storedProducts.splice(i, 1);
            }
        }
    }
    return {
        loadData: loadData,
        storeProduct: storeProduct,
        getStoredProduct: getStoredProduct,
        deleteStoredProduct: deleteStoredProduct
    }
}(context));

var lm = new logicModule();
var label = {
    titlePgs: { en: "Product Groups" },
    canNotLoad: { en: "Cannot load data" },
    titlePg: { en: "Products" },
    backLabel: { en: "Back" },
    canNotLoadProduct: { en: "Can not load product" },
    sendRequest: { en: "Send request for configured product" },
    orderCode: { en: "Order code: " },
    notSelectedError: { en: "Field is required" },
    toLongError: { en: "Your input is to long. It can contain max letters:" },
    reload: { en: "Undo changes" },
}

var pgs = new Vue({
    el: '#productGroupsDiv',
    data: {
        productGroups: [],
        errors: [],
        titlePgs: label.titlePgs[context.language],
        context: context,
        active: false,
    },
    methods: {
        setData: function (loaded) {
            
            if (loaded === undefined || loaded.length === 0) {
                this.active = true;
                this.errors.push(label.canNotLoad[context.language]);
            } else {
                for (let i = 0; i < loaded.length; i++) {
                    loaded[i].active = false;
                    for (let ii = 0; ii < loaded[i].products.length; ii++) {
                        loaded[i].products[ii].active = false;
                        loaded[i].products[ii].collapsed = false;
                    }
                }
                this.productGroups = loaded;
                if (loaded.length === 1) {
                    this.active = false;
                    this.pgButton(this.productGroups[0]);
                }
                else { this.active = true; }
            }
        },
        invokeChild: function (data) {
            pg.activate(false); pg.clearData();
            pr.activate(false); pr.clearData();
            if (data === undefined) { this.errors.push() }
            else {
                this.animate(data);
                pg.setData(data); pg.activate(true);
            }
        },
        pgButton: function (productGroup) {
            this.invokeChild(productGroup);
        },
        animate: function (productGroup) {

            for (let i = 0; i < this.productGroups.length; i++) {
                this.productGroups[i].active = false;
            }
            productGroup.active = true;
        }
    },
    beforeMount: function () {
        var self = this;
        dm.loadData(context.dataPath + '/data/productGroups.txt', 'productGroups', function (data) {
            if(data === undefined){self.setData(); return}
            if (context.url !== "buzzWord") {
                dm.loadData(context.dataPath + '/data/internetGroups.txt', 'internetGroups', function (internetGroups) {
                    var internetGroup = {};
                    var filteredPgs = [];

                    if(internetGroups === undefined){self.setData(); return;}
                    for (let i = 0; i < internetGroups.length; i++) {
                        if (internetGroups[i].id[context.language] === context.url) {
                            internetGroup = internetGroups[i];
                        }
                    }
                    if (internetGroup.productGroups === {}
                        || internetGroup.productGroups === null
                        || internetGroup.productGroups === undefined) { self.setData(); return }

                    for (let i = 0; i < internetGroup.productGroups.length; i++) {
                        for (let pgs = 0; pgs < data.length; pgs++) {
                            if (data[pgs].id === internetGroup.productGroups[i]) {
                                filteredPgs.push(data[pgs]);
                            }
                        }
                    }
                    self.setData(filteredPgs);
                });
            } else {
                self.setData(data);
            }
        });
    }
});

var pg = new Vue({
    el: '#productGroupDiv',
    data: {
        products: [],
        errors: [],
        titlePg: label.titlePg[context.language],
        backLabel: label.backLabel[context.language],
        context: context,
        active: false,
        collapsed: false,
    },
    methods: {
        setData: function (productGroup) {
            this.products = productGroup.products;
        },
        activate: function (bool) {
            this.active = bool; this.collapsed = false;
        },
        clearData: function () {
            for (let i = 0; i < this.products.length; i++) {
                this.products[i].active = false; this.products[i].collapsed = false;
            }
            this.collapsed = false; this.products = {}; this.errors = [];
        },
        invokeChild: function (id) {
            this.errors = [];
            pr.activate(false); pr.clearData();

            var storedPr = dm.getStoredProduct(id);
            if (storedPr) {
                pr.setData(storedPr, "stored"); pr.activate(true);
            } else {
                dm.loadData(context.dataPath + '/data/' + id + '.txt', 'product', function (loaded) {
                    if (loaded === undefined) {
                        pg.errors.push(label.canNotLoadProduct[context.language]);
                    } else {
                        loaded.changed = false;
                        for (let i = 0; i < loaded.properties.length; i++) {
                            loaded.properties[i].error = {};
                            loaded.properties[i].error.toLong = false;
                            loaded.properties[i].error.notSelected = false;
                            loaded.properties[i].value = '';

                            for (let o = 0; o < loaded.properties[i].options.length; o++) {
                                loaded.properties[i].options[o].disabled = false;
                            }
                        }
                        pr.setData(loaded, "loaded"); pr.activate(true);
                    }
                });
            }
        },
        pButton: function (product) {
            this.animate(product);
            this.collapsed = true;
            this.collapse();
            this.invokeChild(product.id);
        },
        animate: function (product) {
            for (let i = 0; i < this.products.length; i++) {
                this.products[i].active = false;
            }
            product.active = true;
        },
        collapse: function () {
            for (let i = 0; i < this.products.length; i++) {
                if (this.collapsed) { if (!this.products[i].active) this.products[i].collapsed = true }
                else { this.products[i].collapsed = false; }
            }
        },
        backButton: function () {
            this.errors = [];
            pr.activate(false); pr.clearData();
            this.collapsed = false; this.collapse();
        }
    },
});

var pr = new Vue({
    el: '#productDiv',
    data: {
        properties: [],
        id: '',
        errors: [],
        sendRequestLabel: label.sendRequest[context.language],
        orderCodeLabel: label.orderCode[context.language],
        notSelectedErrorLabel: label.notSelectedError[context.language],
        toLongErrorLabel: label.toLongError[context.language],
        reloadLabel: label.reload[context.language],
        orderCode: "",
        context: context, // to do lang instead of context
        active: false,
        changes: false,
    },
    methods: {
        setData: function (product, dataSource) {
            this.properties = product.properties; this.id = product.id; this.changes = product.changed;
            if (!product.changed) { this.configDefaultSettings(); }
            this.parseOrderCode();
        },
        activate: function (bool) {
            this.active = bool;
        },
        clearData: function () {
            if (this.changes) dm.storeProduct({ id: this.id, properties: this.properties, changed: true });
            this.properties = []; this.id = []; this.orderCode = ""; this.changes = false;
        },
        reloadButton: function () {
            dm.deleteStoredProduct(this.id);
            this.changes = false;
            pg.invokeChild(this.id);
        },
        configDefaultSettings: function () {
            for (let i = 0; i < this.properties.length; i++) {
                this.setDefault(this.properties[i]);
            }
            this.enforceConstraints();
        },
        setDefault: function (property) {
            var defaultSetBool = false;
            // sets property to default
            for (let i = 0; i < property.options.length; i++) {
                if (property.options[i].default === 'TRUE' && !property.options[i].disabled) {
                    property.value = property.options[i].code;
                    defaultSetBool = true;
                }
            }
            // if only one option is left un disabled, sets property to that option
            var notDisabled = [];
            for (let i = 0; i < property.options.length; i++) {
                if (!property.options[i].disabled) {
                    notDisabled.push(property.options[i]);
                }
            }
            if (notDisabled.length === 1) { property.value = notDisabled[0].code; defaultSetBool = true; }

            if (!defaultSetBool) { property.value = ""; }
            if (this.isCustomStringProperty(property)) { property.value = ""; }
        },
        setSelected: function () {
            for (let i = 0; i < this.properties.length; i++) {
                if (this.properties[i].value !== "") { this.properties[i].error.notSelected = false; }
            }
            this.changes = true;
            this.enforceConstraints();
            this.parseOrderCode();
        },
        isCustomStringProperty: function (property) {
            if (property.options[0].code.startsWith("string")) { return true }
            return false;
        },
        enforceConstraints: function () {

            var truths = [];
            for (let i = 0; i < this.properties.length; i++) {
                truths.push({
                    property: this.properties[i].id,
                    option: this.properties[i].value,
                });
            }

            var enforcedBool = false;

            for (let p = 0; p < this.properties.length; p++) {

                var seledtedWasDisabledBool = false;
                var prop = this.properties[p];
                for (let o = 0; o < prop.options.length; o++) {
                    if (prop.options[o].constraints !== '' && prop.options[o].constraints !== 'REQUIRED'
                        && lm.getTruth(prop.options[o].constraints, truths)) {

                        prop.options[o].disabled = true;

                        if (prop.value === prop.options[o].code) {
                            seledtedWasDisabledBool = true;
                            this.animateAutoChange(prop);
                            enforcedBool = true;
                        }
                    } else {
                        prop.options[o].disabled = false;
                    }
                }
                if (seledtedWasDisabledBool) {
                    this.setDefault(prop);
                }
                if (this.isCustomStringProperty(prop)) {

                    var limit = (prop.options[0].code).match(/\d+/g).map(Number);
                    if (prop.value.length > limit) {
                        prop.error.toLong = true;
                    } else {
                        prop.error.toLong = false;
                    }
                }
            }
            if (enforcedBool) this.enforceConstraints();
        },
        parseOrderCode: function () {

            var orderString = "";
            for (let i = 0; i < this.properties.length; i++) {
                orderString += this.properties[i].value;
                if (this.properties[i].value === "") { orderString += "xxx"; }
                if (i !== this.properties.length - 1) { orderString += " - "; }
            }
            this.orderCode = orderString;

        },
        animateAutoChange: function (prop) {
            if (document.getElementById('row' + prop.id)) {
                var element = $('#row' + prop.id);
                element.css("background-color", '#ffcc99');

                element.delay(150).queue(function () {
                    element.css("background-color", 'white').dequeue();
                });
            }
        },
        sendRequest: function () {
            var valid = true;
            for (let i = 0; i < this.properties.length; i++) {
                if (this.properties[i].value === "" && this.properties[i].options[0].constraints !== 'REQUIRED') 
                { this.properties[i].error.notSelected = true; }
                if (this.properties[i].error.notSelected || this.properties[i].error.toLong) { valid = false; }
            }
            if (valid) {
                console.log("All well that ends well");
            }
        }
    }
});