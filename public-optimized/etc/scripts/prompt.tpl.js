function renderPrompt(locals) {const config={"user":"consciouscode","database":"u413","domain":"u413.org","scheme":"http","name":"u413","port":8080,"host":"u413.org","version":"1.1.14-alpha","webroot":"","loglevel":"info","debug":false}; function pug_attr(t,e,n,f){return!1!==e&&null!=e&&(e||"class"!==t&&"style"!==t)?!0===e?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function renderPrompt(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (config, cwd, user) {;pug_debug_line = 1;
pug_html = pug_html + "\u003Cnav class=\"prompt\"\u003E";
;pug_debug_line = 2;
pug_html = pug_html + "\u003Csection class=\"authority\"\u003E";
;pug_debug_line = 3;
const nobody = {name: "nobody"};
;pug_debug_line = 4;
if(!user) {
;pug_debug_line = 5;
user = nobody;
;pug_debug_line = 6;
}
else if(!user.name) {
;pug_debug_line = 8;
user.name = "nobody";
;pug_debug_line = 9;
}
;pug_debug_line = 10;
if (user.name === "nobody") {
;pug_debug_line = 11;
pug_html = pug_html + "\u003Cspan class=\"nobody\"\u003E";
;pug_debug_line = 11;
pug_html = pug_html + "nobody\u003C\u002Fspan\u003E";
}
else {
;pug_debug_line = 13;
pug_html = pug_html + "\u003Cspan class=\"user\"\u003E";
;pug_debug_line = 13;
pug_html = pug_html + (pug_escape(null == (pug_interp = user.name) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
}
;pug_debug_line = 14;
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 14;
pug_html = pug_html + "@\u003C\u002Fspan\u003E";
;pug_debug_line = 15;
pug_html = pug_html + "\u003Cspan class=\"host\"\u003E";
;pug_debug_line = 16;
pug_html = pug_html + "\u003Ca href=\"\u002F\"\u003E";
;pug_debug_line = 16;
pug_html = pug_html + (pug_escape(null == (pug_interp = config.host) ? "" : pug_interp)) + "\u003C\u002Fa\u003E\u003C\u002Fspan\u003E\u003C\u002Fsection\u003E";
;pug_debug_line = 17;
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 17;
pug_html = pug_html + ":\u003C\u002Fspan\u003E";
;pug_debug_line = 18;
var pm = cwd.split('/').slice(1);
;pug_debug_line = 19;
var base = pm[pm.length - 1];
;pug_debug_line = 20;
var p = pm.slice(0, -1);
;pug_debug_line = 21;
pug_html = pug_html + "\u003Csection class=\"path\"\u003E";
;pug_debug_line = 22;
pug_html = pug_html + "\u003Cspan class=\"dirs\"\u003E";
;pug_debug_line = 23;
pug_html = pug_html + "\u003Cspan class=\"dir\"\u003E";
;pug_debug_line = 23;
pug_html = pug_html + "\u003Ca href=\"\u002F\"\u003E";
;pug_debug_line = 23;
pug_html = pug_html + "\u002F\u003C\u002Fa\u003E\u003C\u002Fspan\u003E";
;pug_debug_line = 24;
var dp = '/';
;pug_debug_line = 25;
// iterate p
;(function(){
  var $$obj = p;
  if ('number' == typeof $$obj.length) {
      for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
        var d = $$obj[pug_index0];
;pug_debug_line = 26;
pug_html = pug_html + "\u003Cspan class=\"dir\"\u003E";
;pug_debug_line = 27;
dp += d + '/'
;pug_debug_line = 28;
pug_html = pug_html + "\u003Ca" + (pug_attr("href", dp, true, false)) + "\u003E";
;pug_debug_line = 28;
pug_html = pug_html + (pug_escape(null == (pug_interp = d + '/') ? "" : pug_interp)) + "\u003C\u002Fa\u003E\u003C\u002Fspan\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index0 in $$obj) {
      $$l++;
      var d = $$obj[pug_index0];
;pug_debug_line = 26;
pug_html = pug_html + "\u003Cspan class=\"dir\"\u003E";
;pug_debug_line = 27;
dp += d + '/'
;pug_debug_line = 28;
pug_html = pug_html + "\u003Ca" + (pug_attr("href", dp, true, false)) + "\u003E";
;pug_debug_line = 28;
pug_html = pug_html + (pug_escape(null == (pug_interp = d + '/') ? "" : pug_interp)) + "\u003C\u002Fa\u003E\u003C\u002Fspan\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Fspan\u003E";
;pug_debug_line = 29;
pug_html = pug_html + "\u003Cspan class=\"base\"\u003E";
;pug_debug_line = 30;
if (base) {
;pug_debug_line = 31;
pug_html = pug_html + "\u003Ca" + (pug_attr("href", cwd, true, false)) + "\u003E";
;pug_debug_line = 31;
pug_html = pug_html + (pug_escape(null == (pug_interp = base) ? "" : pug_interp)) + "\u003C\u002Fa\u003E";
}
pug_html = pug_html + "\u003C\u002Fspan\u003E\u003C\u002Fsection\u003E";
;pug_debug_line = 32;
pug_html = pug_html + "\u003Cspan class=\"access\"\u003E";
;pug_debug_line = 32;
pug_html = pug_html + (pug_escape(null == (pug_interp = user.access || "$") ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
;pug_debug_line = 33;
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 33;
pug_html = pug_html + "&nbsp;\u003C\u002Fspan\u003E\u003C\u002Fnav\u003E";}.call(this,"config" in locals_for_with?locals_for_with.config:typeof config!=="undefined"?config:undefined,"cwd" in locals_for_with?locals_for_with.cwd:typeof cwd!=="undefined"?cwd:undefined,"user" in locals_for_with?locals_for_with.user:typeof user!=="undefined"?user:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}; return renderPrompt(locals);}