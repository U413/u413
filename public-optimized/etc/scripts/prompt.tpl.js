function pug_attr(t,e,n,f){return!1!==e&&null!=e&&(e||"class"!==t&&"style"!==t)?!0===e?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function renderPrompt(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (cwd, user) {;pug_debug_line = 1;
pug_html = pug_html + "\u003Cdiv class=\"prompt\"\u003E";
;pug_debug_line = 2;
const nobody = {name: "nobody"};
;pug_debug_line = 3;
if(!user) {
;pug_debug_line = 4;
user = nobody;
;pug_debug_line = 5;
}
else if(!user.name) {
;pug_debug_line = 7;
user.name = "nobody";
;pug_debug_line = 8;
}
;pug_debug_line = 9;
if (user.name === "nobody") {
;pug_debug_line = 10;
pug_html = pug_html + "\u003Cspan class=\"nobody\"\u003E";
;pug_debug_line = 10;
pug_html = pug_html + "nobody\u003C\u002Fspan\u003E";
}
else {
;pug_debug_line = 12;
pug_html = pug_html + "\u003Cspan class=\"user\"\u003E";
;pug_debug_line = 12;
pug_html = pug_html + (pug_escape(null == (pug_interp = user.name) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
}
;pug_debug_line = 13;
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 13;
pug_html = pug_html + "@\u003C\u002Fspan\u003E";
;pug_debug_line = 14;
pug_html = pug_html + "\u003Cspan class=\"host\"\u003E";
;pug_debug_line = 15;
pug_html = pug_html + "\u003Ca href=\"\u002F\"\u003E";
;pug_debug_line = 15;
pug_html = pug_html + "u413.org\u003C\u002Fa\u003E\u003C\u002Fspan\u003E";
;pug_debug_line = 16;
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 16;
pug_html = pug_html + ":\u003C\u002Fspan\u003E";
;pug_debug_line = 17;
var pm = cwd.split(/^(.*?\/)([^\/]*?)$/g);
;pug_debug_line = 18;
var p = {dir: pm[1], base: pm[2]};
;pug_debug_line = 19;
pug_html = pug_html + "\u003Cnav\u003E";
;pug_debug_line = 20;
pug_html = pug_html + "\u003Cspan class=\"dirs\"\u003E";
;pug_debug_line = 21;
if (p.dir === '/') {
;pug_debug_line = 22;
pug_html = pug_html + "\u003Cspan class=\"dir\"\u003E";
;pug_debug_line = 22;
pug_html = pug_html + "\u003Ca href=\"\u002F\"\u003E";
;pug_debug_line = 22;
pug_html = pug_html + "\u002F\u003C\u002Fa\u003E\u003C\u002Fspan\u003E";
}
else {
;pug_debug_line = 24;
var pds = p.dir.slice(1, -1).split(/\//g);
;pug_debug_line = 25;
var d = '/';
;pug_debug_line = 26;
// iterate pds
;(function(){
  var $$obj = pds;
  if ('number' == typeof $$obj.length) {
      for (var x = 0, $$l = $$obj.length; x < $$l; x++) {
        var f = $$obj[x];
;pug_debug_line = 27;
pug_html = pug_html + "\u003Cspan class=\"dir\"\u003E";
;pug_debug_line = 28;
d += f + '/'
;pug_debug_line = 29;
pug_html = pug_html + "\u003Ca" + (pug_attr("href", d, true, false)) + "\u003E";
;pug_debug_line = 30;
if (x === pds.length - 1) {
;pug_debug_line = 31;
pug_html = pug_html + (pug_escape(null == (pug_interp = `/${f}/`) ? "" : pug_interp));
}
else {
;pug_debug_line = 33;
pug_html = pug_html + (pug_escape(null == (pug_interp = `/${f}`) ? "" : pug_interp));
}
pug_html = pug_html + "\u003C\u002Fa\u003E\u003C\u002Fspan\u003E";
      }
  } else {
    var $$l = 0;
    for (var x in $$obj) {
      $$l++;
      var f = $$obj[x];
;pug_debug_line = 27;
pug_html = pug_html + "\u003Cspan class=\"dir\"\u003E";
;pug_debug_line = 28;
d += f + '/'
;pug_debug_line = 29;
pug_html = pug_html + "\u003Ca" + (pug_attr("href", d, true, false)) + "\u003E";
;pug_debug_line = 30;
if (x === pds.length - 1) {
;pug_debug_line = 31;
pug_html = pug_html + (pug_escape(null == (pug_interp = `/${f}/`) ? "" : pug_interp));
}
else {
;pug_debug_line = 33;
pug_html = pug_html + (pug_escape(null == (pug_interp = `/${f}`) ? "" : pug_interp));
}
pug_html = pug_html + "\u003C\u002Fa\u003E\u003C\u002Fspan\u003E";
    }
  }
}).call(this);

}
pug_html = pug_html + "\u003C\u002Fspan\u003E";
;pug_debug_line = 34;
pug_html = pug_html + "\u003Cspan class=\"base\"\u003E";
;pug_debug_line = 35;
if (p.base) {
;pug_debug_line = 36;
pug_html = pug_html + "\u003Ca" + (pug_attr("href", cwd, true, false)) + "\u003E";
;pug_debug_line = 36;
pug_html = pug_html + (pug_escape(null == (pug_interp = p.base) ? "" : pug_interp)) + "\u003C\u002Fa\u003E";
}
pug_html = pug_html + "\u003C\u002Fspan\u003E\u003C\u002Fnav\u003E";
;pug_debug_line = 37;
pug_html = pug_html + "\u003Cspan class=\"access\"\u003E";
;pug_debug_line = 37;
pug_html = pug_html + (pug_escape(null == (pug_interp = user.access || "$") ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
;pug_debug_line = 38;
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 38;
pug_html = pug_html + "&nbsp;\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E";}.call(this,"cwd" in locals_for_with?locals_for_with.cwd:typeof cwd!=="undefined"?cwd:undefined,"user" in locals_for_with?locals_for_with.user:typeof user!=="undefined"?user:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}