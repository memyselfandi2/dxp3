const HTMLElement = require('./HTMLElement');
const HTMLTagType = require('./HTMLTagType');
/**
 * @class
 */
class HTMLTag extends HTMLElement {
    /**
     * @constructor
     */
    constructor(_name, _htmlTagType) {
        super();
        this.name = '';
        if(_name != undefined && _name != null) {
            this.name = _name.trim().toLowerCase();
        }
        this.type = HTMLTagType.START_TAG;
        if(_htmlTagType != undefined && _htmlTagType != null) {
            this.type = _htmlTagType;
        }
        this.id = HTMLTag.stringToTagMap.get(this.name);
        if (this.id === undefined || this.id == null) {
            this.id = HTMLTag.TAG_UNKNOWN;
        }
        this.attributes = new Map();
    }
    
    getNodeName() {
        return this.name;
    }

    get nodeName() {
        return this.getNodeName();
    }

    getId() {
        return this.id;
    }

    getHTMLTagType() {
        return this.type;
    }

    get htmlTagType() {
        return this.getHTMLTagType();
    }

    setHTMLTagType(_htmlTagType) {
        this.type = _htmlTagType;
    }

    set htmlTagType(_htmlTagType) {
        this.setHTMLTagType(_htmlTagType);
    }

    addAttribute(_key, _value) {
        if(_key === undefined || _key === null) {
            return;
        }
        let key = _key.trim().toLowerCase();
        if(key.length <= 0) {
            return;
        }
        let value = null;
        if(_value != undefined && _value != null) {
            value = _value;
        }
        this.attributes.set(key, value);
    }

    addAttributes(_keyValues) {
        if(_keyValues === undefined || _keyValues === null) {
            return;
        }
        for(let [_key, _value] of _keyValues) {
            if(_key === undefined || _key === null) {
                continue;
            }
            let key = _key.trim().toLowerCase();
            if(key.length <= 0) {
                continue;
            }
            let value = null;
            if(_value != undefined && _value != null) {
                value = _value;
            }
            this.attributes.set(key, value);
        }
    }

    hasAttribute(_key) {
        if(_key === undefined || _key === null) {
            return false;
        }
        let key = _key.trim().toLowerCase();
        if(key.length <= 0) {
            return false;
        }
        return this.attributes.has(key);
    }

    getAttributes() {
        return this.attributes;
    }

    getAttribute(_key) {
        return this.getAttributeValue(_key);
    }

    getAttributeValue(_key) {
        if(_key === undefined || _key === null) {
            return null;
        }
        let key = _key.trim().toLowerCase();
        if(key.length <= 0) {
            return null;
        }
        return this.attributes.get(key);
    }

    setValue(_value) {
        this.setAttributeValue('value', _value);
    }

    setAttribute(_key, _value) {
        this.setAttributeValue(_key, _value);
    }

    setAttributeValue(_key, _value) {
        if(_key === undefined || _key === null) {
            return;
        }
        let key = _key.trim().toLowerCase();
        if(key.length <= 0) {
            return;
        }
        let value = null;
        if(_value != undefined && _value != null) {
            value = _value;
        }
        this.attributes.set(key, value);
    }

    /**
     * @override
     */
    toString() {
        let result = '<';
        if (this.type === HTMLTagType.END_TAG) {
            result += '/';
        }
        result += this.name;
        for(let [key, value] of this.attributes) {
            result += ' ' + key;
            if(value != null) {
                result += '="' + value + '"';
            }
        }
        if (this.type === HTMLTagType.START_END_TAG) {
            result += '/';
        }
        result += '>';
        return result;
    }

    static isValid(possibleHTMLTagAsString) {
        if(possibleHTMLTagAsString === undefined || possibleHTMLTagAsString === null) {
            return false;
        }
        possibleHTMLTagAsString = possibleHTMLTagAsString.trim().toLowerCase();
        if(possibleHTMLTagAsString.length <= 0) {
            return false;
        }
        // Remove any prefixed slash
        if (possibleHTMLTagAsString.startsWith('/')) {
            possibleHTMLTagAsString = possibleHTMLTagAsString.substring(1);
        }
        return HTMLTag.stringToTagMap.has(possibleHTMLTagAsString);
    }
}
HTMLTag.TAG_A = 10;
HTMLTag.TAG_ABBR = 20;
HTMLTag.TAG_ACRONYM = 30;
HTMLTag.TAG_ADDRESS = 40;
HTMLTag.TAG_APPLET = 50;
HTMLTag.TAG_AREA = 60;
HTMLTag.TAG_B = 70;
HTMLTag.TAG_BASE = 80;
HTMLTag.TAG_BASEFONT = 90;
HTMLTag.TAG_BDO = 100;
HTMLTag.TAG_BIG = 110;
HTMLTag.TAG_BLOCKQUOTE = 120;
HTMLTag.TAG_BODY = 130;
HTMLTag.TAG_BR = 140;
HTMLTag.TAG_BUTTON = 150;
HTMLTag.TAG_CAPTION = 160;
HTMLTag.TAG_CENTER = 170;
HTMLTag.TAG_CITE = 180;
HTMLTag.TAG_CODE = 190;
HTMLTag.TAG_COL = 200;
HTMLTag.TAG_COLGROUP = 210;
HTMLTag.TAG_DD = 220;
HTMLTag.TAG_DEL = 230;
HTMLTag.TAG_DFN = 240;
HTMLTag.TAG_DIR = 250;
HTMLTag.TAG_DIV = 260;
HTMLTag.TAG_DL = 270;
HTMLTag.TAG_DT = 280;
HTMLTag.TAG_EM = 290;
HTMLTag.TAG_FIELDSET = 300;
HTMLTag.TAG_FIGCAPTION = 304;
HTMLTag.TAG_FIGURE = 305;
HTMLTag.TAG_FONT = 310;
HTMLTag.TAG_FOOTER = 315;
HTMLTag.TAG_FORM = 320;
HTMLTag.TAG_FRAME = 330;
HTMLTag.TAG_FRAMESET = 340;
HTMLTag.TAG_HEAD = 350;
HTMLTag.TAG_H1 = 360;
HTMLTag.TAG_H2 = 370;
HTMLTag.TAG_H3 = 380;
HTMLTag.TAG_H4 = 390;
HTMLTag.TAG_H5 = 400;
HTMLTag.TAG_H6 = 410;
HTMLTag.TAG_HR = 420;
HTMLTag.TAG_HTML = 430;
HTMLTag.TAG_I = 440;
HTMLTag.TAG_IFRAME = 450;
HTMLTag.TAG_IMG = 460;
HTMLTag.TAG_INPUT = 470;
HTMLTag.TAG_INS = 480;
HTMLTag.TAG_KBD = 490;
HTMLTag.TAG_LABEL = 500;
HTMLTag.TAG_LEGEND = 510;
HTMLTag.TAG_LI = 520;
HTMLTag.TAG_LINK = 530;
HTMLTag.TAG_MAP = 540;
HTMLTag.TAG_MENU = 550;
HTMLTag.TAG_META = 560;
HTMLTag.TAG_NAV = 563;
HTMLTag.TAG_NOBR = 565;
HTMLTag.TAG_NOFRAMES = 570;
HTMLTag.TAG_NOSCRIPT = 580;
HTMLTag.TAG_OBJECT = 590;
HTMLTag.TAG_OL = 600;
HTMLTag.TAG_OPTGROUP = 610;
HTMLTag.TAG_OPTION = 620;
HTMLTag.TAG_P = 630;
HTMLTag.TAG_PARAM = 640;
HTMLTag.TAG_PRE = 650;
HTMLTag.TAG_Q = 660;
HTMLTag.TAG_S = 670;
HTMLTag.TAG_SAMP = 680;
HTMLTag.TAG_SCRIPT = 690;
HTMLTag.TAG_SELECT = 700;
HTMLTag.TAG_SMALL = 710;
HTMLTag.TAG_SPAN = 720;
HTMLTag.TAG_STRIKE = 730;
HTMLTag.TAG_STRONG = 740;
HTMLTag.TAG_STYLE = 750;
HTMLTag.TAG_SUB = 760;
HTMLTag.TAG_SUP = 770;
HTMLTag.TAG_TABLE = 780;
HTMLTag.TAG_TBODY = 790;
HTMLTag.TAG_TD = 800;
HTMLTag.TAG_TEXTAREA = 810;
HTMLTag.TAG_TFOOT = 820;
HTMLTag.TAG_TH = 830;
HTMLTag.TAG_THEAD = 840;
HTMLTag.TAG_TITLE = 850;
HTMLTag.TAG_TR = 860;
HTMLTag.TAG_TT = 870;
HTMLTag.TAG_U = 880;
HTMLTag.TAG_UL = 890;
HTMLTag.TAG_VAR = 900;
HTMLTag.TAG_UNKNOWN = 910;

HTMLTag.stringToTagMap = new Map();
HTMLTag.stringToTagMap.set("a", HTMLTag.TAG_A);
HTMLTag.stringToTagMap.set("abbr", HTMLTag.TAG_ABBR);
HTMLTag.stringToTagMap.set("acronym", HTMLTag.TAG_ACRONYM);
HTMLTag.stringToTagMap.set("address", HTMLTag.TAG_ADDRESS);
HTMLTag.stringToTagMap.set("applet", HTMLTag.TAG_APPLET);
HTMLTag.stringToTagMap.set("area", HTMLTag.TAG_AREA);
HTMLTag.stringToTagMap.set("b", HTMLTag.TAG_B);
HTMLTag.stringToTagMap.set("base", HTMLTag.TAG_BASE);
HTMLTag.stringToTagMap.set("basefont", HTMLTag.TAG_BASEFONT);
HTMLTag.stringToTagMap.set("bdo", HTMLTag.TAG_BDO);
HTMLTag.stringToTagMap.set("big", HTMLTag.TAG_BIG);
HTMLTag.stringToTagMap.set("blockquote", HTMLTag.TAG_BLOCKQUOTE);
HTMLTag.stringToTagMap.set("body", HTMLTag.TAG_BODY);
HTMLTag.stringToTagMap.set("br", HTMLTag.TAG_BR);
HTMLTag.stringToTagMap.set("button", HTMLTag.TAG_BUTTON);
HTMLTag.stringToTagMap.set("caption", HTMLTag.TAG_CAPTION);
HTMLTag.stringToTagMap.set("center", HTMLTag.TAG_CENTER);
HTMLTag.stringToTagMap.set("cite", HTMLTag.TAG_CITE);
HTMLTag.stringToTagMap.set("code", HTMLTag.TAG_CODE);
HTMLTag.stringToTagMap.set("col", HTMLTag.TAG_COL);
HTMLTag.stringToTagMap.set("colgroup", HTMLTag.TAG_COLGROUP);
HTMLTag.stringToTagMap.set("dd", HTMLTag.TAG_DD);
HTMLTag.stringToTagMap.set("del", HTMLTag.TAG_DEL);
HTMLTag.stringToTagMap.set("dfn", HTMLTag.TAG_DFN);
HTMLTag.stringToTagMap.set("dir", HTMLTag.TAG_DIR);
HTMLTag.stringToTagMap.set("div", HTMLTag.TAG_DIV);
HTMLTag.stringToTagMap.set("dl", HTMLTag.TAG_DL);
HTMLTag.stringToTagMap.set("dt", HTMLTag.TAG_DT);
HTMLTag.stringToTagMap.set("em", HTMLTag.TAG_EM);
HTMLTag.stringToTagMap.set("fieldset", HTMLTag.TAG_FIELDSET);
HTMLTag.stringToTagMap.set("figcaption", HTMLTag.TAG_FIGCAPTION);
HTMLTag.stringToTagMap.set("figure", HTMLTag.TAG_FIGURE);
HTMLTag.stringToTagMap.set("font", HTMLTag.TAG_FONT);
HTMLTag.stringToTagMap.set("footer", HTMLTag.TAG_FOOTER);
HTMLTag.stringToTagMap.set("form", HTMLTag.TAG_FORM);
HTMLTag.stringToTagMap.set("frame", HTMLTag.TAG_FRAME);
HTMLTag.stringToTagMap.set("frameset", HTMLTag.TAG_FRAMESET);
HTMLTag.stringToTagMap.set("head", HTMLTag.TAG_HEAD);
HTMLTag.stringToTagMap.set("hr", HTMLTag.TAG_HR);
HTMLTag.stringToTagMap.set("h1", HTMLTag.TAG_H1);
HTMLTag.stringToTagMap.set("h2", HTMLTag.TAG_H2);
HTMLTag.stringToTagMap.set("h3", HTMLTag.TAG_H3);
HTMLTag.stringToTagMap.set("h4", HTMLTag.TAG_H4);
HTMLTag.stringToTagMap.set("h5", HTMLTag.TAG_H5);
HTMLTag.stringToTagMap.set("h6", HTMLTag.TAG_H6);
HTMLTag.stringToTagMap.set("html", HTMLTag.TAG_HTML);
HTMLTag.stringToTagMap.set("i", HTMLTag.TAG_I);
HTMLTag.stringToTagMap.set("iframe", HTMLTag.TAG_IFRAME);
HTMLTag.stringToTagMap.set("img", HTMLTag.TAG_IMG);
HTMLTag.stringToTagMap.set("input", HTMLTag.TAG_INPUT);
HTMLTag.stringToTagMap.set("ins", HTMLTag.TAG_INS);
HTMLTag.stringToTagMap.set("kbd", HTMLTag.TAG_KBD);
HTMLTag.stringToTagMap.set("label", HTMLTag.TAG_LABEL);
HTMLTag.stringToTagMap.set("legend", HTMLTag.TAG_LEGEND);
HTMLTag.stringToTagMap.set("li", HTMLTag.TAG_LI);
HTMLTag.stringToTagMap.set("link", HTMLTag.TAG_LINK);
HTMLTag.stringToTagMap.set("map", HTMLTag.TAG_MAP);
HTMLTag.stringToTagMap.set("menu", HTMLTag.TAG_MENU);
HTMLTag.stringToTagMap.set("meta", HTMLTag.TAG_META);
HTMLTag.stringToTagMap.set("nav", HTMLTag.TAG_NAV);
HTMLTag.stringToTagMap.set("nobr", HTMLTag.TAG_NOBR);
HTMLTag.stringToTagMap.set("noframes", HTMLTag.TAG_NOFRAMES);
HTMLTag.stringToTagMap.set("noscript", HTMLTag.TAG_NOSCRIPT);
HTMLTag.stringToTagMap.set("object", HTMLTag.TAG_OBJECT);
HTMLTag.stringToTagMap.set("ol", HTMLTag.TAG_OL);
HTMLTag.stringToTagMap.set("optgroup", HTMLTag.TAG_OPTGROUP);
HTMLTag.stringToTagMap.set("option", HTMLTag.TAG_OPTION);
HTMLTag.stringToTagMap.set("p", HTMLTag.TAG_P);
HTMLTag.stringToTagMap.set("param", HTMLTag.TAG_PARAM);
HTMLTag.stringToTagMap.set("pre", HTMLTag.TAG_PRE);
HTMLTag.stringToTagMap.set("q", HTMLTag.TAG_Q);
HTMLTag.stringToTagMap.set("s", HTMLTag.TAG_S);
HTMLTag.stringToTagMap.set("samp", HTMLTag.TAG_SAMP);
HTMLTag.stringToTagMap.set("script", HTMLTag.TAG_SCRIPT);
HTMLTag.stringToTagMap.set("select", HTMLTag.TAG_SELECT);
HTMLTag.stringToTagMap.set("small", HTMLTag.TAG_SMALL);
HTMLTag.stringToTagMap.set("span", HTMLTag.TAG_SPAN);
HTMLTag.stringToTagMap.set("strike", HTMLTag.TAG_STRIKE);
HTMLTag.stringToTagMap.set("strong", HTMLTag.TAG_STRONG);
HTMLTag.stringToTagMap.set("style", HTMLTag.TAG_STYLE);
HTMLTag.stringToTagMap.set("sub", HTMLTag.TAG_SUB);
HTMLTag.stringToTagMap.set("sup", HTMLTag.TAG_SUP);
HTMLTag.stringToTagMap.set("table", HTMLTag.TAG_TABLE);
HTMLTag.stringToTagMap.set("tbody", HTMLTag.TAG_TBODY);
HTMLTag.stringToTagMap.set("td", HTMLTag.TAG_TD);
HTMLTag.stringToTagMap.set("textarea", HTMLTag.TAG_TEXTAREA);
HTMLTag.stringToTagMap.set("tfoot", HTMLTag.TAG_TFOOT);
HTMLTag.stringToTagMap.set("th", HTMLTag.TAG_TH);
HTMLTag.stringToTagMap.set("thead", HTMLTag.TAG_THEAD);
HTMLTag.stringToTagMap.set("title", HTMLTag.TAG_TITLE);
HTMLTag.stringToTagMap.set("tr", HTMLTag.TAG_TR);
HTMLTag.stringToTagMap.set("tt", HTMLTag.TAG_TT);
HTMLTag.stringToTagMap.set("u", HTMLTag.TAG_U);
HTMLTag.stringToTagMap.set("ul", HTMLTag.TAG_UL);
HTMLTag.stringToTagMap.set("var", HTMLTag.TAG_VAR);

module.exports = HTMLTag;