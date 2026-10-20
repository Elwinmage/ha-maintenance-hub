var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=/* @__PURE__ */ new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:f,getOwnPropertySymbols:p,getPrototypeOf:m}=Object,h=globalThis,g=h.trustedTypes,_=g?g.emptyScript:``,ee=h.reactiveElementPolyfillSupport,v=(e,t)=>e,y={toAttribute(e,t){switch(t){case Boolean:e=e?_:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},b=(e,t)=>!l(e,t),x={attribute:!0,type:String,converter:y,reflect:!1,useDefault:!1,hasChanged:b};Symbol.metadata??=Symbol(`metadata`),h.litPropertyMetadata??=/* @__PURE__ */ new WeakMap;var S=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=x){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??x}static _$Ei(){if(this.hasOwnProperty(v(`elementProperties`)))return;let e=m(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(v(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(v(`properties`))){let e=this.properties,t=[...f(e),...p(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=/* @__PURE__ */ new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=/* @__PURE__ */ new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=/* @__PURE__ */ new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=/* @__PURE__ */ new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?y:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?y:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??b)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=/* @__PURE__ */ new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=/* @__PURE__ */ new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=/* @__PURE__ */ new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};S.elementStyles=[],S.shadowRootOptions={mode:`open`},S[v(`elementProperties`)]=/* @__PURE__ */ new Map,S[v(`finalized`)]=/* @__PURE__ */ new Map,ee?.({ReactiveElement:S}),(h.reactiveElementVersions??=[]).push(`2.1.2`);var C=globalThis,te=e=>e,w=C.trustedTypes,ne=w?w.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,re=`$lit$`,T=`lit$${Math.random().toFixed(9).slice(2)}$`,ie=`?`+T,ae=`<${ie}>`,E=document,D=()=>E.createComment(``),O=e=>e===null||typeof e!=`object`&&typeof e!=`function`,k=Array.isArray,oe=e=>k(e)||typeof e?.[Symbol.iterator]==`function`,A=`[ 	
\f\r]`,j=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,M=/-->/g,se=/>/g,N=RegExp(`>|${A}(?:([^\\s"'>=/]+)(${A}*=${A}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),ce=/'/g,le=/"/g,ue=/^(?:script|style|textarea|title)$/i,P=(e=>(t,...n)=>({_$litType$:e,strings:t,values:n}))(1),F=Symbol.for(`lit-noChange`),I=Symbol.for(`lit-nothing`),de=/* @__PURE__ */ new WeakMap,L=E.createTreeWalker(E,129);function fe(e,t){if(!k(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return ne===void 0?t:ne.createHTML(t)}var pe=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=j;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===j?c[1]===`!--`?o=M:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=N):(ue.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=N):o=se:o===N?c[0]===`>`?(o=i??j,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?N:c[3]===`"`?le:ce):o===le||o===ce?o=N:o===M||o===se?o=j:(o=N,i=void 0);let d=o===N&&e[t+1].startsWith(`/>`)?` `:``;a+=o===j?n+ae:l>=0?(r.push(s),n.slice(0,l)+re+n.slice(l)+T+d):n+T+(l===-2?t:d)}return[fe(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},R=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=pe(t,n);if(this.el=e.createElement(l,r),L.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=L.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(re)){let t=u[o++],n=i.getAttribute(e).split(T),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?he:r[1]===`?`?ge:r[1]===`@`?_e:V}),i.removeAttribute(e)}else e.startsWith(T)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(ue.test(i.tagName)){let e=i.textContent.split(T),t=e.length-1;if(t>0){i.textContent=w?w.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],D()),L.nextNode(),c.push({type:2,index:++a});i.append(e[t],D())}}}else if(i.nodeType===8){if(i.data===ie)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(T,e+1))!==-1;)c.push({type:7,index:a}),e+=T.length-1}}a++}}static createElement(e,t){let n=E.createElement(`template`);return n.innerHTML=e,n}};function z(e,t,n=e,r){if(t===F)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=O(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=z(e,i._$AS(e,t.values),i,r)),t}var me=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??E).importNode(t,!0);L.currentNode=r;let i=L.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new B(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new ve(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=L.nextNode(),a++)}return L.currentNode=E,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},B=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=I,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=z(this,e,t),O(e)?e===I||e==null||e===``?(this._$AH!==I&&this._$AR(),this._$AH=I):e!==this._$AH&&e!==F&&this._(e):e._$litType$===void 0?e.nodeType===void 0?oe(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==I&&O(this._$AH)?this._$AA.nextSibling.data=e:this.T(E.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=R.createElement(fe(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new me(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=de.get(e.strings);return t===void 0&&de.set(e.strings,t=new R(e)),t}k(t){k(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(D()),this.O(D()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=te(e).nextSibling;te(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},V=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=I,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(/* @__PURE__ */ new String),this.strings=n):this._$AH=I}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=z(this,e,t,0),a=!O(e)||e!==this._$AH&&e!==F,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=z(this,r[n+o],t,o),s===F&&(s=this._$AH[o]),a||=!O(s)||s!==this._$AH[o],s===I?e=I:e!==I&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===I?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},he=class extends V{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===I?void 0:e}},ge=class extends V{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==I)}},_e=class extends V{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=z(this,e,t,0)??I)===F)return;let n=this._$AH,r=e===I&&n!==I||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==I&&(n===I||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},ve=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){z(this,e)}},ye=C.litHtmlPolyfillSupport;ye?.(R,B),(C.litHtmlVersions??=[]).push(`3.3.3`);var be=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new B(t.insertBefore(D(),e),e,void 0,n??{})}return i._$AI(e),i},H=globalThis,U=class extends S{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=be(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return F}};U._$litElement$=!0,U.finalized=!0,H.litElementHydrateSupport?.({LitElement:U});var xe=H.litElementPolyfillSupport;xe?.({LitElement:U}),(H.litElementVersions??=[]).push(`4.2.2`);var Se=`_notify`,W=`_interval_`,G=.2,K=`maintenance_hub`,Ce=[`days`,`weeks`,`months`,`years`];function q(e,t){if(e==null||e===``)return t;let n=Number(e);return Number.isFinite(n)?n:t}function we(e){if(e==null||e===``)return null;let t=Number(e);return Number.isFinite(t)?t:null}function Te(e){let t=String(e||``).replace(/[_-]+/g,` `).trim();return t.length===0?``:t.charAt(0).toUpperCase()+t.slice(1)}function Ee(e,t){return e?t&&e.startsWith(t+` `)?e.slice(t.length+1):e:``}function De(e,t=G){return e<=0?0:Math.max(1,Math.round(e*t))}function Oe(e,t,n=G){return e===null?`never`:e<0?`overdue`:e<=De(t,n)?`warning`:`ok`}function ke(e,t){if(e===null||t<=0)return 0;let n=(t-e)/t*100;return Math.min(100,Math.max(0,Math.round(n)))}function Ae(e,t,n){let r=t,i=/* @__PURE__ */ new Set;for(;r&&e[r]&&!i.has(r);){i.add(r);let t=e[r].via_device_id;if(typeof t!=`string`||t===``||!e[t])break;r=t}let a=r?e[r]:void 0,o=a?.name_by_user||a?.name||``;return{id:r||``,name:o||n}}function je(e,t){for(let n of e)n.location_id===null&&(n.location_id=`__${n.backend}__`,n.location_name=t);return e}function Me(e,t){return e.days_left===null&&t.days_left===null?0:e.days_left===null?1:t.days_left===null?-1:e.days_left-t.days_left}function Ne(e,t){let n=e.location_name??``,r=t.location_name??``;return n===r?0:n===``?1:r===``?-1:n.localeCompare(r)}function Pe(e,t){let n=[...e];return n.sort((e,n)=>t===`due`?Me(e,n)||e.device_name.localeCompare(n.device_name)||e.name.localeCompare(n.name):Ne(e,n)||e.device_name.localeCompare(n.device_name)||Me(e,n)||e.name.localeCompare(n.name)),n}function Fe(e){let t=[],n={};for(let r of e){let e=r.device_id||r.device_name,i=n[e];i||(i={device_id:r.device_id,device_name:r.device_name,pump_type:r.pump_type,pump_model:r.pump_model,items:[]},n[e]=i,t.push(i)),i.items.push(r)}return t}function Ie(e){let t=[],n={},r={};for(let i of e){let e=i.location_id??``;n[e]||(n[e]=[],r[e]=i,t.push(e)),n[e].push(i)}return t.map(e=>({location_id:r[e].location_id,location_name:r[e].location_name,groups:Fe(n[e])}))}function Le(e){let t={},n=[];for(let r of e){let e=r.device_id||r.device_name,i=t[e];i||(i={id:r.device_id,name:r.device_name,count:0,pump_type:r.pump_type,pump_model:r.pump_model},t[e]=i,n.push(i)),i.count+=1}return n.sort((e,t)=>e.name.localeCompare(t.name)),n}function J(e){let t={},n=[];for(let r of e){if(r.location_id===null)continue;let e=t[r.location_id];e||(e={id:r.location_id,name:r.location_name??r.location_id,count:0},t[r.location_id]=e,n.push(e)),e.count+=1}return n.sort((e,t)=>e.name.localeCompare(t.name)),n}function Re(e,t){if(!Array.isArray(t))return e;let n=t.filter(e=>typeof e==`string`&&e.length>0);if(n.length===0)return e;let r=new Set(n);return e.filter(e=>r.has(e.root_device_id)||r.has(e.root_device_name)||r.has(e.device_id)||r.has(e.device_name)||n.some(t=>e.device_name.startsWith(t+` `)))}function ze(e,t){if(!Array.isArray(t))return e;let n=new Set(t.filter(e=>typeof e==`string`&&e.length>0));return n.size===0?e:e.filter(e=>e.location_id!==null&&n.has(e.location_id)||e.location_name!==null&&n.has(e.location_name))}function Be(e){let t={total:e.length,overdue:0,warning:0,never:0};for(let n of e)n.status===`overdue`?t.overdue+=1:n.status===`warning`?t.warning+=1:n.status===`never`&&(t.never+=1);return t}function Ve(e){return e.map(e=>{let t=e.frequency,n=t?`${t.unit}:${t.value}:${t.mode===`free`?t.anchor:`${t.min}-${t.max}`}`:``;return`${e.entity_id}|${e.days_left}|${e.interval_days}|${e.device_name}|${e.last_reset}|${e.notify}|${n}|${e.location_name}|${e.name}`}).sort().join(`;`)}function He(e,t,n={}){return e.flatMap(e=>e.collect(t,n))}function Ue(e,t){return e.find(e=>e.id===t.backend)}var Y={de:{days_short:`T`,editor_include_reef:`Aquarium-Wartungsaufgaben einbeziehen`,editor_locations:`Standorte`,editor_locations_hint:`Kein Standort ausgewählt: alle werden angezeigt`,editor_no_location:`Noch kein Standort: in Einstellungen › Geräte & Dienste › Maintenance Hub hinzufügen`,editor_reef_location:`Name der Aquarium-Gruppe`,editor_show_interval:`Intervall-Editor anzeigen`,editor_show_notify:`Glocke anzeigen`,editor_show_reset:`Schaltfläche „erledigt“ anzeigen`,editor_sort_default:`Standardsortierung`,editor_title:`Titel`,maintenance_all_equipment:`Alle Geräte`,maintenance_all_locations:`Alle Standorte`,maintenance_all_ok:`Alles aktuell`,maintenance_apply:`Übernehmen`,maintenance_cancel:`Abbrechen`,maintenance_due_soon:`bald fällig`,maintenance_edit_interval:`Intervall ändern`,maintenance_every:`Alle`,maintenance_filter_devices:`Nach Gerät filtern`,maintenance_filter_devices_all:`Alle Geräte anzeigen`,maintenance_filter_devices_hint:`Kein Gerät ausgewählt: alle Aufgaben werden angezeigt`,maintenance_hide_muted:`Stumme ausblenden`,maintenance_hide_muted_default:`Stummgeschaltete Aufgaben standardmäßig ausblenden`,maintenance_hide_ok:`Aktuelle Aufgaben ausblenden`,maintenance_hide_ok_default:`Aktuelle Aufgaben standardmäßig ausblenden`,maintenance_interval:`Intervall`,maintenance_last_reset:`Zuletzt erledigt`,maintenance_mark_done:`Als erledigt markieren`,maintenance_mute:`Benachrichtigungen für diese Aufgabe deaktivieren`,maintenance_never_done:`nie durchgeführt`,maintenance_next_on:`Nächste am`,maintenance_no_task:`Keine Wartungsaufgabe erkannt`,maintenance_overdue:`überfällig`,maintenance_reef_location:`Aquarium`,maintenance_regulatory:`Gesetzliche Pflicht`,maintenance_seasonal:`Saisonales Datum`,maintenance_seasonal_hint:`Kommt jedes Jahr an diesem Datum zurück`,maintenance_show_muted:`Stumme anzeigen`,maintenance_today:`heute`,maintenance_unmute:`Benachrichtigungen für diese Aufgabe aktivieren`,maintenance_view:`Wartung`,pump_type_return:`Rückförder`,pump_type_skimmer:`Abschäumer`,sort_by_due_date:`Nach Fälligkeit`,sort_by_equipment:`Nach Gerät`,unit_days:`Tage`,unit_months:`Monate`,unit_weeks:`Wochen`,unit_years:`Jahre`},en:{days_short:`d`,editor_include_reef:`Include aquarium maintenance tasks`,editor_locations:`Locations`,editor_locations_hint:`No location selected: every location is shown`,editor_no_location:`No location yet: add one in Settings › Devices & services › Maintenance Hub`,editor_reef_location:`Name of the aquarium group`,editor_show_interval:`Show the interval editor`,editor_show_notify:`Show the alert bell`,editor_show_reset:`Show the "done" button`,editor_sort_default:`Default sort`,editor_title:`Title`,maintenance_all_equipment:`All equipment`,maintenance_all_locations:`All locations`,maintenance_all_ok:`All up to date`,maintenance_apply:`Apply`,maintenance_cancel:`Cancel`,maintenance_due_soon:`due soon`,maintenance_edit_interval:`Change the interval`,maintenance_every:`Every`,maintenance_filter_devices:`Filter by device`,maintenance_filter_devices_all:`Show every device`,maintenance_filter_devices_hint:`No device selected: every task is shown`,maintenance_hide_muted:`Hide muted`,maintenance_hide_muted_default:`Hide muted tasks by default`,maintenance_hide_ok:`Hide up to date tasks`,maintenance_hide_ok_default:`Hide up to date tasks by default`,maintenance_interval:`Interval`,maintenance_last_reset:`Last done`,maintenance_mark_done:`Mark as done`,maintenance_mute:`Mute alerts for this task`,maintenance_never_done:`never done`,maintenance_next_on:`Next on`,maintenance_no_task:`No maintenance task detected`,maintenance_overdue:`overdue`,maintenance_reef_location:`Aquarium`,maintenance_regulatory:`Regulatory obligation`,maintenance_seasonal:`Seasonal date`,maintenance_seasonal_hint:`Comes back on this date each season`,maintenance_show_muted:`Show muted`,maintenance_today:`today`,maintenance_unmute:`Enable alerts for this task`,maintenance_view:`Maintenance`,pump_type_return:`return`,pump_type_skimmer:`skimmer`,sort_by_due_date:`By due date`,sort_by_equipment:`By equipment`,unit_days:`days`,unit_months:`months`,unit_weeks:`weeks`,unit_years:`years`},es:{days_short:`d`,editor_include_reef:`Incluir las tareas de mantenimiento del acuario`,editor_locations:`Ubicaciones`,editor_locations_hint:`Ninguna ubicación seleccionada: se muestran todas`,editor_no_location:`Aún no hay ubicaciones: añada una en Ajustes › Dispositivos y servicios › Maintenance Hub`,editor_reef_location:`Nombre del grupo del acuario`,editor_show_interval:`Mostrar el editor de intervalo`,editor_show_notify:`Mostrar la campana`,editor_show_reset:`Mostrar el botón «hecho»`,editor_sort_default:`Orden por defecto`,editor_title:`Título`,maintenance_all_equipment:`Todos los equipos`,maintenance_all_locations:`Todas las ubicaciones`,maintenance_all_ok:`Todo al día`,maintenance_apply:`Aplicar`,maintenance_cancel:`Cancelar`,maintenance_due_soon:`próxima`,maintenance_edit_interval:`Modificar el intervalo`,maintenance_every:`Cada`,maintenance_filter_devices:`Filtrar por dispositivo`,maintenance_filter_devices_all:`Mostrar todos los dispositivos`,maintenance_filter_devices_hint:`Ningún dispositivo seleccionado: se muestran todas las tareas`,maintenance_hide_muted:`Ocultar silenciadas`,maintenance_hide_muted_default:`Ocultar por defecto las tareas silenciadas`,maintenance_hide_ok:`Ocultar las tareas al día`,maintenance_hide_ok_default:`Ocultar por defecto las tareas al día`,maintenance_interval:`Intervalo`,maintenance_last_reset:`Última vez`,maintenance_mark_done:`Marcar como realizada`,maintenance_mute:`Desactivar las alertas de esta tarea`,maintenance_never_done:`nunca realizada`,maintenance_next_on:`Próxima el`,maintenance_no_task:`No se ha detectado ninguna tarea de mantenimiento`,maintenance_overdue:`atrasada`,maintenance_reef_location:`Acuario`,maintenance_regulatory:`Obligación reglamentaria`,maintenance_seasonal:`Fecha estacional`,maintenance_seasonal_hint:`Vuelve en esta fecha cada temporada`,maintenance_show_muted:`Mostrar silenciadas`,maintenance_today:`hoy`,maintenance_unmute:`Activar las alertas de esta tarea`,maintenance_view:`Mantenimiento`,pump_type_return:`Retorno`,pump_type_skimmer:`Espumador`,sort_by_due_date:`Por vencimiento`,sort_by_equipment:`Por equipo`,unit_days:`días`,unit_months:`meses`,unit_weeks:`semanas`,unit_years:`años`},fr:{days_short:`j`,editor_include_reef:`Inclure les tâches de maintenance de l'aquarium`,editor_locations:`Emplacements`,editor_locations_hint:`Aucun emplacement sélectionné : tous sont affichés`,editor_no_location:`Aucun emplacement : ajoutez-en un dans Paramètres › Appareils et services › Maintenance Hub`,editor_reef_location:`Nom du groupe aquarium`,editor_show_interval:`Afficher l'éditeur d'intervalle`,editor_show_notify:`Afficher la cloche`,editor_show_reset:`Afficher le bouton « fait »`,editor_sort_default:`Tri par défaut`,editor_title:`Titre`,maintenance_all_equipment:`Tous les équipements`,maintenance_all_locations:`Tous les emplacements`,maintenance_all_ok:`Tout est à jour`,maintenance_apply:`Appliquer`,maintenance_cancel:`Annuler`,maintenance_due_soon:`bientôt`,maintenance_edit_interval:`Modifier l'intervalle`,maintenance_every:`Tous les`,maintenance_filter_devices:`Filtrer par appareil`,maintenance_filter_devices_all:`Afficher tous les appareils`,maintenance_filter_devices_hint:`Aucun appareil sélectionné : toutes les tâches sont affichées`,maintenance_hide_muted:`Masquer les silencieuses`,maintenance_hide_muted_default:`Masquer par défaut les tâches silencieuses`,maintenance_hide_ok:`Masquer les tâches à jour`,maintenance_hide_ok_default:`Masquer par défaut les tâches à jour`,maintenance_interval:`Intervalle`,maintenance_last_reset:`Dernière fois`,maintenance_mark_done:`Marquer comme effectuée`,maintenance_mute:`Désactiver les alertes de cette tâche`,maintenance_never_done:`jamais effectuée`,maintenance_next_on:`Prochaine le`,maintenance_no_task:`Aucune tâche de maintenance détectée`,maintenance_overdue:`en retard`,maintenance_reef_location:`Aquarium`,maintenance_regulatory:`Obligation réglementaire`,maintenance_seasonal:`Date saisonnière`,maintenance_seasonal_hint:`Revient à cette date chaque saison`,maintenance_show_muted:`Afficher les silencieuses`,maintenance_today:`aujourd'hui`,maintenance_unmute:`Activer les alertes de cette tâche`,maintenance_view:`Maintenance`,pump_type_return:`Retour`,pump_type_skimmer:`Écumeur`,sort_by_due_date:`Par échéance`,sort_by_equipment:`Par équipement`,unit_days:`jours`,unit_months:`mois`,unit_weeks:`semaines`,unit_years:`ans`},it:{days_short:`g`,editor_include_reef:`Includi le attività di manutenzione dell'acquario`,editor_locations:`Posizioni`,editor_locations_hint:`Nessuna posizione selezionata: vengono mostrate tutte`,editor_no_location:`Nessuna posizione: aggiungine una in Impostazioni › Dispositivi e servizi › Maintenance Hub`,editor_reef_location:`Nome del gruppo acquario`,editor_show_interval:`Mostra l'editor dell'intervallo`,editor_show_notify:`Mostra la campanella`,editor_show_reset:`Mostra il pulsante «fatto»`,editor_sort_default:`Ordinamento predefinito`,editor_title:`Titolo`,maintenance_all_equipment:`Tutte le apparecchiature`,maintenance_all_locations:`Tutte le posizioni`,maintenance_all_ok:`Tutto aggiornato`,maintenance_apply:`Applica`,maintenance_cancel:`Annulla`,maintenance_due_soon:`in scadenza`,maintenance_edit_interval:`Modificare l'intervallo`,maintenance_every:`Ogni`,maintenance_filter_devices:`Filtra per dispositivo`,maintenance_filter_devices_all:`Mostra tutti i dispositivi`,maintenance_filter_devices_hint:`Nessun dispositivo selezionato: vengono mostrate tutte le attività`,maintenance_hide_muted:`Nascondi silenziate`,maintenance_hide_muted_default:`Nascondi per impostazione predefinita le attività silenziate`,maintenance_hide_ok:`Nascondi le attività aggiornate`,maintenance_hide_ok_default:`Nascondi per impostazione predefinita le attività aggiornate`,maintenance_interval:`Intervallo`,maintenance_last_reset:`Ultima volta`,maintenance_mark_done:`Segna come eseguita`,maintenance_mute:`Disattiva gli avvisi di questa attività`,maintenance_never_done:`mai eseguita`,maintenance_next_on:`Prossima il`,maintenance_no_task:`Nessuna attività di manutenzione rilevata`,maintenance_overdue:`in ritardo`,maintenance_reef_location:`Acquario`,maintenance_regulatory:`Obbligo normativo`,maintenance_seasonal:`Data stagionale`,maintenance_seasonal_hint:`Ritorna in questa data ogni stagione`,maintenance_show_muted:`Mostra silenziate`,maintenance_today:`oggi`,maintenance_unmute:`Attiva gli avvisi di questa attività`,maintenance_view:`Manutenzione`,pump_type_return:`Ritorno`,pump_type_skimmer:`Schiumatoio`,sort_by_due_date:`Per scadenza`,sort_by_equipment:`Per apparecchio`,unit_days:`giorni`,unit_months:`mesi`,unit_weeks:`settimane`,unit_years:`anni`},pl:{days_short:`d`,editor_include_reef:`Uwzględnij zadania konserwacji akwarium`,editor_locations:`Lokalizacje`,editor_locations_hint:`Nie wybrano lokalizacji: wyświetlane są wszystkie`,editor_no_location:`Brak lokalizacji: dodaj ją w Ustawienia › Urządzenia i usługi › Maintenance Hub`,editor_reef_location:`Nazwa grupy akwarium`,editor_show_interval:`Pokaż edytor interwału`,editor_show_notify:`Pokaż dzwonek`,editor_show_reset:`Pokaż przycisk „wykonane”`,editor_sort_default:`Domyślne sortowanie`,editor_title:`Tytuł`,maintenance_all_equipment:`Wszystkie urządzenia`,maintenance_all_locations:`Wszystkie lokalizacje`,maintenance_all_ok:`Wszystko aktualne`,maintenance_apply:`Zastosuj`,maintenance_cancel:`Anuluj`,maintenance_due_soon:`wkrótce`,maintenance_edit_interval:`Zmień interwał`,maintenance_every:`Co`,maintenance_filter_devices:`Filtruj według urządzenia`,maintenance_filter_devices_all:`Pokaż wszystkie urządzenia`,maintenance_filter_devices_hint:`Nie wybrano urządzenia: wyświetlane są wszystkie zadania`,maintenance_hide_muted:`Ukryj wyciszone`,maintenance_hide_muted_default:`Domyślnie ukrywaj wyciszone zadania`,maintenance_hide_ok:`Ukryj aktualne zadania`,maintenance_hide_ok_default:`Domyślnie ukrywaj aktualne zadania`,maintenance_interval:`Interwał`,maintenance_last_reset:`Ostatnio wykonano`,maintenance_mark_done:`Oznacz jako wykonane`,maintenance_mute:`Wyłącz powiadomienia dla tego zadania`,maintenance_never_done:`nigdy nie wykonano`,maintenance_next_on:`Następna`,maintenance_no_task:`Nie wykryto żadnego zadania konserwacji`,maintenance_overdue:`zaległe`,maintenance_reef_location:`Akwarium`,maintenance_regulatory:`Obowiązek prawny`,maintenance_seasonal:`Data sezonowa`,maintenance_seasonal_hint:`Wraca w tym dniu co sezon`,maintenance_show_muted:`Pokaż wyciszone`,maintenance_today:`dzisiaj`,maintenance_unmute:`Włącz powiadomienia dla tego zadania`,maintenance_view:`Konserwacja`,pump_type_return:`Powrotna`,pump_type_skimmer:`Odpieniacz`,sort_by_due_date:`Wg terminu`,sort_by_equipment:`Wg urządzenia`,unit_days:`dni`,unit_months:`miesiące`,unit_weeks:`tygodnie`,unit_years:`lata`},pt:{days_short:`d`,editor_include_reef:`Incluir as tarefas de manutenção do aquário`,editor_locations:`Locais`,editor_locations_hint:`Nenhum local selecionado: todos são exibidos`,editor_no_location:`Ainda sem locais: adicione um em Definições › Dispositivos e serviços › Maintenance Hub`,editor_reef_location:`Nome do grupo do aquário`,editor_show_interval:`Mostrar o editor de intervalo`,editor_show_notify:`Mostrar o sino`,editor_show_reset:`Mostrar o botão «feito»`,editor_sort_default:`Ordenação por omissão`,editor_title:`Título`,maintenance_all_equipment:`Todos os equipamentos`,maintenance_all_locations:`Todos os locais`,maintenance_all_ok:`Tudo em dia`,maintenance_apply:`Aplicar`,maintenance_cancel:`Cancelar`,maintenance_due_soon:`em breve`,maintenance_edit_interval:`Alterar o intervalo`,maintenance_every:`A cada`,maintenance_filter_devices:`Filtrar por dispositivo`,maintenance_filter_devices_all:`Mostrar todos os dispositivos`,maintenance_filter_devices_hint:`Nenhum dispositivo selecionado: todas as tarefas são exibidas`,maintenance_hide_muted:`Ocultar silenciadas`,maintenance_hide_muted_default:`Ocultar por omissão as tarefas silenciadas`,maintenance_hide_ok:`Ocultar as tarefas em dia`,maintenance_hide_ok_default:`Ocultar por omissão as tarefas em dia`,maintenance_interval:`Intervalo`,maintenance_last_reset:`Última vez`,maintenance_mark_done:`Marcar como realizada`,maintenance_mute:`Desativar os alertas desta tarefa`,maintenance_never_done:`nunca realizada`,maintenance_next_on:`Próxima em`,maintenance_no_task:`Nenhuma tarefa de manutenção detetada`,maintenance_overdue:`em atraso`,maintenance_reef_location:`Aquário`,maintenance_regulatory:`Obrigação regulamentar`,maintenance_seasonal:`Data sazonal`,maintenance_seasonal_hint:`Volta nesta data a cada estação`,maintenance_show_muted:`Mostrar silenciadas`,maintenance_today:`hoje`,maintenance_unmute:`Ativar os alertas desta tarefa`,maintenance_view:`Manutenção`,pump_type_return:`Retorno`,pump_type_skimmer:`Escumador`,sort_by_due_date:`Por prazo`,sort_by_equipment:`Por equipamento`,unit_days:`dias`,unit_months:`meses`,unit_weeks:`semanas`,unit_years:`anos`}};Object.keys(Y);function We(e){let t=e?.locale?.language||e?.language||`en`,n=String(t).toLowerCase().split(/[-_]/)[0];return n in Y?n:`en`}function Ge(e,t=`en`){return Y[t]?.[e]??Y.en[e]??e}function Ke(e,t=`en`){return e in(Y[t]??{})||e in Y.en}var qe=`reef`;function Je(e,t){let n=e?.attributes;if(!n)return!1;let r=t??e?.entity_id;if(typeof r==`string`&&!r.startsWith(`button.`))return!1;let i=n.reef_role;return typeof i!=`string`||!i.startsWith(`maint_`)?!1:typeof n.task_key==`string`&&n.task_key.length>0}function Ye(e){let t={},n=e.entities||{};for(let r in e.states){if(!r.startsWith(`switch.`))continue;let i=e.states[r]?.attributes?.reef_role;if(typeof i!=`string`||!i.startsWith(`maint_`)||!i.endsWith(`_notify`))continue;let a=i.slice(0,-Se.length),o=n[r]?.device_id||``;t[`${o}|${a}`]=r}return t}function Xe(e){let t=e.entities||{},n={};for(let r in e.states){if(!r.startsWith(`sensor.`))continue;let i=e.states[r],a=i?.attributes?.reef_role;if(a!==`type`&&a!==`model`)continue;let o=t[r]?.device_id;if(!o)continue;let s=i.state;if(typeof s!=`string`||s===``||s===`unknown`||s===`unavailable`)continue;let c=n[o]??={type:null,model:null};a===`type`?c.type=s:c.model=s}let r={};for(let e in n){let t=n[e];t.type!==null&&t.model!==null&&(r[e]=t)}return r}function Ze(e){let t={},n=e.entities||{};for(let r in e.states){if(!r.startsWith(`number.`))continue;let i=e.states[r],a=i?.attributes?.reef_role;if(typeof a!=`string`||!a.startsWith(`maint_`))continue;let o=a.lastIndexOf(W);if(o<0)continue;let s=a.slice(o+W.length);if(s!==`days`&&s!==`weeks`&&s!==`months`)continue;let c=i.attributes,l=Number(i.state),u=n[r]?.device_id||``,d=Number(c.step);t[`${u}|${a.slice(0,o)}`]={entity_id:r,unit:s,value:Number.isFinite(l)?l:null,min:Number.isFinite(Number(c.min))?Number(c.min):null,max:Number.isFinite(Number(c.max))?Number(c.max):null,step:Number.isFinite(d)&&d>0?d:1}}return t}function Qe(e,t={}){let n=[];if(!e?.states)return n;let r=t.warning_ratio??.2,i=e.entities||{},a=e.devices||{},o=Ye(e),s=Ze(e),c=Xe(e);for(let t in e.states){let l=e.states[t];if(!Je(l,t))continue;let u=l.attributes,d=i[t]?.device_id||``,f=d?a[d]:void 0;if(f?.disabled_by)continue;let p=f?.name_by_user||f?.name||u.device_name||``,m=Ae(a,d,p),h=Math.max(0,q(u.interval_days,0)),g=we(u.days_left),_=g!==null&&g<0,ee=Ee(String(u.friendly_name||``),p),v=String(u.reef_role),y=s[`${d}|${v}`]??null,b=o[`${d}|${v}`]??null,x=d?c[d]??null:null;n.push({backend:qe,entity_id:t,task_key:String(u.task_key),role:v,notify:u.notify!==!1,can_notify:b!==null,frequency:y?{mode:`slider`,unit:y.unit,value:y.value??y.min??1,min:y.min??1,max:y.max??365,step:y.step}:null,refs:{notify_entity_id:b,interval_entity_id:y?.entity_id??null},pump_type:x?.type??null,pump_model:x?.model??null,name:ee||Te(String(u.task_key)),icon:typeof u.icon==`string`?u.icon:null,device_id:d,device_name:p,root_device_id:m.id,root_device_name:m.name,model:f?.model||``,location_id:null,location_name:null,regulatory:u.regulatory===!0,interval_days:h,days_left:g,overdue:_,overdue_days:_?Math.abs(g):0,last_reset:typeof u.last_reset==`string`?u.last_reset:null,percent:ke(g,h),status:Oe(g,h,r)})}return n}var $e={id:qe,collect:Qe,reset(e,t){e.callService(`button`,`press`,{entity_id:t.entity_id})},setFrequency(e,t,n){let r=t.refs.interval_entity_id,i=t.frequency;if(!r||!i||i.mode!==`slider`||!Number.isFinite(n.value))return;let a=Math.min(i.max,Math.max(i.min,n.value));e.callService(`number`,`set_value`,{entity_id:r,value:a})},setNotify(e,t,n){let r=t.refs.notify_entity_id;r&&e.callService(`switch`,n?`turn_on`:`turn_off`,{entity_id:r})}};function et(e,t){let n=e?.attributes;if(!n)return!1;let r=t??e?.entity_id;if(typeof r==`string`&&!r.startsWith(`sensor.`))return!1;let i=n.maint_role;return typeof i!=`string`||!i.startsWith(`maint_`)?!1:typeof n.task_key==`string`&&n.task_key.length>0}function tt(e){return Ce.includes(e)?e:`months`}function nt(e,t={}){let n=[];if(!e?.states)return n;let r=t.warning_ratio??.2,i=e.entities||{},a=e.devices||{};for(let t in e.states){let o=e.states[t];if(!et(o,t))continue;let s=o.attributes,c=i[t]?.device_id||``,l=c?a[c]:void 0;if(l?.disabled_by)continue;let u=l?.name_by_user||l?.name||``,d=Ae(a,c,u),f=Math.max(0,q(s.interval_days,0)),p=we(s.days_left),m=p!==null&&p<0,h=Ee(String(s.friendly_name||``),u),g=typeof s.anchor==`string`&&s.anchor!==``?s.anchor:null,_=typeof s.location_id==`string`?s.location_id:``;n.push({backend:`hub`,entity_id:t,task_key:String(s.task_key),role:String(s.maint_role),notify:s.notify!==!1,can_notify:!0,frequency:{mode:`free`,unit:tt(s.frequency_unit),value:Math.max(1,Math.round(q(s.frequency_value,1))),anchor:g},refs:{},pump_type:null,pump_model:null,name:h||Te(String(s.task_key)),icon:typeof s.icon==`string`?s.icon:null,device_id:c,device_name:u,root_device_id:d.id,root_device_name:d.name,model:l?.model||``,location_id:_,location_name:typeof s.location_name==`string`?s.location_name:_,regulatory:s.regulatory===!0,interval_days:f,days_left:p,overdue:m,overdue_days:m?Math.abs(p):0,last_reset:typeof s.last_reset==`string`?s.last_reset:null,percent:ke(p,f),status:Oe(p,f,r)})}return n}var rt={id:`hub`,collect:nt,reset(e,t){e.callService(K,`reset`,{entity_id:[t.entity_id]})},setFrequency(e,t,n){if(!Number.isFinite(n.value)||n.value<1)return;let r=n.unit===`years`?n.anchor??``:``;e.callService(K,`set_frequency`,{entity_id:[t.entity_id],unit:n.unit,value:Math.round(n.value),anchor:r})},setNotify(e,t,n){e.callService(K,`set_notify`,{entity_id:[t.entity_id],notify:n})}},it=o`
  :host {
    --maint-ok: var(--success-color, #43a047);
    --maint-warning: var(--warning-color, #ffa600);
    --maint-overdue: var(--error-color, #db4437);
    --maint-never: var(--disabled-text-color, #9e9e9e);
    --maint-text: var(--primary-text-color, #e1e1e1);
    --maint-text-soft: var(--secondary-text-color, #9b9b9b);
    --maint-divider: var(--divider-color, rgba(127, 127, 127, 0.3));
    display: block;
  }

  .maint-root {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px 4px 12px 4px;
    color: var(--maint-text);
    font-size: 14px;
  }

  /* Inside a device dialog: the dialog is always white, whatever the theme,
     so the list brings its own card background to stay readable. */
  .maint-root.embedded {
    min-width: 300px;
    max-height: 60vh;
    overflow-y: auto;
    padding: 8px 10px 12px 10px;
    border-radius: 12px;
    background: var(--card-background-color, #1c1c1c);
  }

  .maint-root.embedded .maint-header {
    justify-content: flex-end;
  }

  /* ── Header ─────────────────────────────────────────────────────────── */

  .maint-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--maint-divider);
  }

  .maint-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 1.1em;
    font-weight: 600;
  }

  .maint-counters {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .maint-badge {
    border-radius: 12px;
    padding: 1px 8px;
    font-size: 0.75em;
    font-weight: 600;
    color: white;
    white-space: nowrap;
  }

  .maint-badge.overdue {
    background-color: var(--maint-overdue);
  }
  .maint-badge.warning {
    background-color: var(--maint-warning);
  }
  .maint-badge.ok {
    background-color: var(--maint-ok);
  }
  .maint-badge.never {
    background-color: var(--maint-never);
  }

  /* ── Toolbar ────────────────────────────────────────────────────────── */

  .maint-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .maint-sort {
    display: inline-flex;
    border: 1px solid var(--maint-divider);
    border-radius: 16px;
    overflow: hidden;
  }

  .maint-sort button {
    background: transparent;
    border: none;
    color: var(--maint-text-soft);
    cursor: pointer;
    font-size: 0.8em;
    font-family: inherit;
    padding: 4px 12px;
  }

  .maint-sort button.active {
    background-color: var(--primary-color, #03a9f4);
    color: white;
    font-weight: 600;
  }

  .maint-toolbar-left {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .maint-equip-select {
    appearance: auto;
    background: transparent;
    border: 1px solid var(--maint-divider);
    border-radius: 16px;
    color: var(--maint-text);
    cursor: pointer;
    font-family: inherit;
    font-size: 0.8em;
    padding: 4px 10px;
  }

  .maint-equip-select:focus {
    outline: none;
    border-color: var(--primary-color, #03a9f4);
  }

  .maint-filter {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--maint-text-soft);
    cursor: pointer;
    font-size: 0.8em;
  }

  .maint-filters {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }

  .maint-mute-filter {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: transparent;
    border: 1px solid var(--maint-divider);
    border-radius: 16px;
    color: var(--maint-text-soft);
    cursor: pointer;
    font-family: inherit;
    font-size: 0.8em;
    padding: 3px 10px;
    --mdc-icon-size: 15px;
  }

  .maint-mute-filter:hover {
    color: var(--primary-color, #03a9f4);
    border-color: var(--primary-color, #03a9f4);
  }

  .maint-mute-filter.active {
    background-color: var(--primary-color, #03a9f4);
    border-color: var(--primary-color, #03a9f4);
    color: white;
    font-weight: 600;
  }

  /* ── Groups & rows ──────────────────────────────────────────────────── */

  .maint-group-title {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
    color: var(--maint-text-soft);
    font-size: 0.85em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .maint-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
  }

  .maint-icon {
    flex: 0 0 auto;
    color: var(--maint-text-soft);
    --mdc-icon-size: 20px;
  }

  .maint-body {
    flex: 1 1 auto;
    min-width: 0;
    cursor: pointer;
  }

  .maint-line {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
  }

  .maint-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .maint-device {
    color: var(--maint-text-soft);
    font-size: 0.8em;
  }

  .maint-remaining {
    flex: 0 0 auto;
    font-size: 0.85em;
    font-weight: 600;
    white-space: nowrap;
  }

  .maint-remaining.ok {
    color: var(--maint-ok);
  }
  .maint-remaining.warning {
    color: var(--maint-warning);
  }
  .maint-remaining.overdue {
    color: var(--maint-overdue);
  }
  .maint-remaining.never {
    color: var(--maint-never);
  }

  /* ── Progress bar ───────────────────────────────────────────────────── */

  .maint-bar {
    position: relative;
    height: 8px;
    margin-top: 3px;
    border-radius: 8px;
    background-color: var(--maint-divider);
    overflow: hidden;
  }

  .maint-bar-fill {
    height: 100%;
    border-radius: 8px;
    transition: width 0.3s ease;
  }

  .maint-bar-fill.ok {
    background-color: var(--maint-ok);
  }
  .maint-bar-fill.warning {
    background-color: var(--maint-warning);
  }
  .maint-bar-fill.overdue {
    background-color: var(--maint-overdue);
  }
  .maint-bar-fill.never {
    background-color: var(--maint-never);
  }

  /* ── Reset button ───────────────────────────────────────────────────── */

  .maint-done {
    flex: 0 0 auto;
    background: transparent;
    border: 1px solid var(--maint-divider);
    border-radius: 50%;
    color: var(--maint-text-soft);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 26px;
    width: 26px;
    padding: 0;
    --mdc-icon-size: 16px;
  }

  .maint-done:hover {
    border-color: var(--maint-ok);
    color: var(--maint-ok);
  }

  /* ── Notification bell ──────────────────────────────────────────────── */

  .maint-bell {
    flex: 0 0 auto;
    background: transparent;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 26px;
    width: 22px;
    padding: 0;
    --mdc-icon-size: 16px;
  }

  .maint-bell.on {
    color: var(--maint-text-soft);
  }

  .maint-bell.off {
    color: var(--maint-never);
  }

  .maint-bell:hover {
    color: var(--primary-color, #03a9f4);
  }

  /* Muted tasks stay visible but visually recede: the deadline still
     matters, only the alerting is off. */
  .maint-row.muted .maint-name,
  .maint-row.muted .maint-remaining,
  .maint-row.muted .maint-icon {
    opacity: 0.55;
  }

  .maint-row.muted .maint-bar {
    opacity: 0.45;
  }

  /* ── Interval editor ────────────────────────────────────────────────── */

  .maint-tune {
    flex: 0 0 auto;
    background: transparent;
    border: none;
    color: var(--maint-text-soft);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 26px;
    width: 22px;
    padding: 0;
    --mdc-icon-size: 16px;
  }

  .maint-tune:hover,
  .maint-tune.open {
    color: var(--primary-color, #03a9f4);
  }

  .maint-editor {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 0 0 8px 28px;
    padding: 8px 10px;
    border-radius: 8px;
    background-color: rgba(127, 127, 127, 0.12);
  }

  .maint-editor-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .maint-editor-label {
    color: var(--maint-text-soft);
    font-size: 0.85em;
  }

  .maint-editor-value {
    font-size: 0.9em;
    font-weight: 600;
  }

  .maint-editor-bound {
    color: var(--maint-text-soft);
    font-size: 0.75em;
    min-width: 1.5em;
    text-align: center;
  }

  .maint-slider {
    flex: 1 1 auto;
    accent-color: var(--primary-color, #03a9f4);
    cursor: pointer;
    min-width: 0;
  }

  /* ── Editor form ────────────────────────────────────────────────────── */

  .maint-editor-form {
    color: var(--maint-text);
    font-size: 0.9em;
    padding: 4px 0;
  }

  .maint-editor-form td {
    padding: 6px 0;
  }

  .maint-editor-form .switch {
    position: relative;
    display: inline-block;
    width: 30px;
    height: 17px;
    vertical-align: middle;
    margin-right: 8px;
  }

  .maint-editor-form .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .maint-editor-form .slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background-color: #ccc;
    transition: 0.4s;
  }

  .maint-editor-form .slider:before {
    position: absolute;
    content: "";
    height: 13px;
    width: 13px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: 0.4s;
  }

  .maint-editor-form input:checked + .slider {
    background-color: var(--primary-color, #03a9f4);
  }

  .maint-editor-form input:checked + .slider:before {
    transform: translateX(13px);
  }

  .maint-editor-form .slider.round {
    border-radius: 17px;
  }

  .maint-editor-form .slider.round:before {
    border-radius: 50%;
  }

  /* ── Editor device filter ───────────────────────────────────────────── */

  .maint-devices-title {
    display: block;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .maint-devices {
    display: flex;
    flex-direction: column;
    gap: 2px;
    max-height: 220px;
    overflow-y: auto;
    padding: 6px 8px;
    border-radius: 8px;
    background-color: rgba(127, 127, 127, 0.12);
  }

  .maint-device-option {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .maint-device-option input {
    accent-color: var(--primary-color, #03a9f4);
    cursor: pointer;
  }

  .maint-device-name {
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .maint-device-count {
    color: var(--maint-text-soft);
    font-size: 0.8em;
  }

  .maint-devices-hint {
    color: var(--maint-text-soft);
    font-size: 0.8em;
    font-style: italic;
    margin-top: 4px;
  }

  .maint-devices-clear {
    background: none;
    border: none;
    color: var(--primary-color, #03a9f4);
    cursor: pointer;
    font: inherit;
    font-style: normal;
    padding: 0;
  }

  /* ── Empty state ────────────────────────────────────────────────────── */

  .maint-empty {
    color: var(--maint-text-soft);
    font-style: italic;
    padding: 12px 4px;
    text-align: center;
  }

  /* ── Location level ─────────────────────────────────────────────────── */

  .maint-location-title {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    padding-bottom: 2px;
    border-bottom: 1px solid var(--maint-divider);
    font-size: 0.95em;
    font-weight: 600;
    --mdc-icon-size: 18px;
  }

  .maint-location-title:first-child {
    margin-top: 2px;
  }

  .maint-location-title ha-icon {
    color: var(--maint-text-soft);
  }

  /* ── Regulatory marker ──────────────────────────────────────────────── */

  .maint-regulatory {
    color: var(--maint-text-soft);
    margin-left: 2px;
    vertical-align: -2px;
    --mdc-icon-size: 14px;
  }

  /* ── Free frequency editor (unit + value + seasonal date) ───────────── */

  .maint-editor-free {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 6px;
  }

  .maint-editor-free input[type="number"],
  .maint-editor-free select {
    background: transparent;
    border: 1px solid var(--maint-divider);
    border-radius: 8px;
    color: var(--maint-text);
    font-family: inherit;
    font-size: 0.85em;
    padding: 3px 6px;
  }

  .maint-editor-free input[type="number"] {
    width: 4.5em;
  }

  .maint-editor-free select option {
    color: initial;
  }

  .maint-editor-free input:focus,
  .maint-editor-free select:focus {
    outline: none;
    border-color: var(--primary-color, #03a9f4);
  }

  .maint-editor-seasonal {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--maint-text-soft);
    cursor: pointer;
    font-size: 0.85em;
  }

  .maint-editor-seasonal input[type="checkbox"] {
    accent-color: var(--primary-color, #03a9f4);
  }

  .maint-editor-hint {
    color: var(--maint-text-soft);
    font-size: 0.75em;
    font-style: italic;
  }

  .maint-editor-actions {
    display: flex;
    justify-content: flex-end;
    gap: 6px;
  }

  .maint-editor-actions button {
    background: transparent;
    border: 1px solid var(--maint-divider);
    border-radius: 16px;
    color: var(--maint-text-soft);
    cursor: pointer;
    font-family: inherit;
    font-size: 0.8em;
    padding: 3px 12px;
  }

  .maint-editor-actions button.primary {
    background-color: var(--primary-color, #03a9f4);
    border-color: var(--primary-color, #03a9f4);
    color: white;
    font-weight: 600;
  }

  .maint-equip-select option {
    color: initial;
  }
`,X={sort:`device`,devices:[],locations:[],hide_ok:!1,hide_muted:!1,warning_ratio:G,show_reset:!0,show_notify:!0,show_interval:!0,title:``,embedded:!1,default_location:``};function at(e){return new Date(2e3,e,0).getDate()}function ot(e){let t=e??{},n=e=>typeof t[e]==`boolean`?t[e]:X[e],r=e=>Array.isArray(e)?e.filter(e=>typeof e==`string`&&e.length>0):[],i=Number(t.warning_ratio);return{sort:t.sort===`due`||t.sort===`device`?t.sort:`device`,devices:r(t.devices),locations:r(t.locations),hide_ok:n(`hide_ok`),hide_muted:n(`hide_muted`),warning_ratio:Number.isFinite(i)&&i>0&&i<1?i:X.warning_ratio,show_reset:n(`show_reset`),show_notify:n(`show_notify`),show_interval:n(`show_interval`),title:typeof t.title==`string`?t.title:``,embedded:n(`embedded`),default_location:typeof t.default_location==`string`?t.default_location:``}}var st=class extends U{static styles=[it];static properties={hass:{attribute:!1},backends:{attribute:!1},options:{attribute:!1},_sort:{state:!0},_hide_ok:{state:!0},_hide_muted:{state:!0},_filter_device:{state:!0},_filter_location:{state:!0},_editing:{state:!0},_draft:{state:!0}};_signature=null;constructor(){super(),this.hass=null,this.backends=[],this.options={},this._sort=X.sort,this._hide_ok=X.hide_ok,this._hide_muted=X.hide_muted,this._filter_device=null,this._filter_location=null,this._editing=null,this._draft=null}get view_options(){return ot(this.options)}get _lang(){return We(this.hass)}_t(e){return Ge(e,this._lang)}collect(e=this.view_options){return Re(ze(je(He(this.backends,this.hass,{warning_ratio:e.warning_ratio}),e.default_location||this._t(`maintenance_reef_location`)),e.locations),e.devices)}shouldUpdate(e){return!(e.size===1&&e.has(`hass`)&&Ve(this.collect())===this._signature)}willUpdate(e){if(e.has(`options`)){let e=this.view_options;this._sort=e.sort,this._hide_ok=e.hide_ok,this._hide_muted=e.hide_muted}}_backend(e){return Ue(this.backends,e)}_more_info(e){this.dispatchEvent(new CustomEvent(`hass-more-info`,{bubbles:!0,composed:!0,detail:{entityId:e.entity_id}}))}_mark_done(e){this.hass&&this._backend(e)?.reset(this.hass,e)}_toggle_notify(e){this.hass&&e.can_notify&&this._backend(e)?.setNotify(this.hass,e,!e.notify)}_toggle_editor(e){if(this._editing===e.entity_id){this._editing=null,this._draft=null;return}this._editing=e.entity_id;let t=e.frequency;if(t?.mode===`free`){let[e,n]=(t.anchor??``).split(`-`).map(Number);this._draft={unit:t.unit,value:t.value,seasonal:t.anchor!==null,month:e||1,day:n||1}}else this._draft=null}_set_slider(e,t){let n=e.frequency;this.hass&&n?.mode===`slider`&&Number.isFinite(t)&&this._backend(e)?.setFrequency(this.hass,e,{unit:n.unit,value:t,anchor:null})}_update_draft(e){if(!this._draft)return;let t={...this._draft,...e};t.day=Math.min(Math.max(1,t.day),at(t.month)),this._draft=t}_apply_draft(e){let t=this._draft;if(!this.hass||!t)return;let n=Math.min(999,Math.max(1,Math.round(t.value))),r=t.seasonal&&t.unit===`years`?`${String(t.month).padStart(2,`0`)}-${String(t.day).padStart(2,`0`)}`:null;this._backend(e)?.setFrequency(this.hass,e,{unit:t.unit,value:n,anchor:r}),this._editing=null,this._draft=null}_pump_suffix(e,t){let n=[];if(e){let t=`pump_type_${e}`;n.push(Ke(t,this._lang)?this._t(t):e)}if(t){let e=t.match(/(\d+)\s*$/);n.push(e?e[1]:t)}return n.length>0?` (${n.join(` `)})`:``}_device_label(e,t,n){return`${e}${this._pump_suffix(t,n)}`}_unit_label(e){return e?this._t(`unit_${e}`):``}_remaining_label(e){return e.days_left===null?this._t(`maintenance_never_done`):e.days_left<0?`+${e.overdue_days} ${this._t(`days_short`)}`:e.days_left===0?this._t(`maintenance_today`):`${e.days_left} ${this._t(`days_short`)}`}_row_title(e){let t=[`${this._device_label(e.device_name,e.pump_type,e.pump_model)} - ${e.name}`];if(e.regulatory&&t.push(this._t(`maintenance_regulatory`)),e.interval_days>0&&t.push(`${this._t(`maintenance_interval`)}: ${e.interval_days} ${this._t(`days_short`)}`),e.last_reset){let n=new Date(e.last_reset);Number.isNaN(n.getTime())||t.push(`${this._t(`maintenance_last_reset`)}: ${n.toLocaleDateString()}`)}if(e.days_left!==null){let n=/* @__PURE__ */ new Date;n.setDate(n.getDate()+e.days_left),t.push(`${this._t(`maintenance_next_on`)}: ${n.toLocaleDateString()}`)}return t.join(`
`)}_month_names(){let e=new Intl.DateTimeFormat(this._lang,{month:`long`});return Array.from({length:12},(t,n)=>e.format(new Date(2e3,n,1)))}_render_counters(e){let t=Be(e),n=[];return t.overdue>0&&n.push(P`<span class="maint-badge overdue"
          >${t.overdue} ${this._t(`maintenance_overdue`)}</span
        >`),t.warning>0&&n.push(P`<span class="maint-badge warning"
          >${t.warning} ${this._t(`maintenance_due_soon`)}</span
        >`),t.never>0&&n.push(P`<span class="maint-badge never"
          >${t.never} ${this._t(`maintenance_never_done`)}</span
        >`),n.length===0&&t.total>0&&n.push(P`<span class="maint-badge ok"
          >${this._t(`maintenance_all_ok`)}</span
        >`),P`<div class="maint-counters">${n}</div>`}_render_location_filter(e){let t=J(e);return t.length<=1?P``:P`
      <select
        class="maint-equip-select maint-location-select"
        @change="${e=>{let t=e.currentTarget.value;this._filter_location=t===``?null:t,this._filter_device=null}}"
      >
        <option value="" ?selected="${this._filter_location===null}">
          ${this._t(`maintenance_all_locations`)}
        </option>
        ${t.map(e=>P`
            <option
              value="${e.id}"
              ?selected="${this._filter_location===e.id}"
            >
              ${e.name} (${e.count})
            </option>
          `)}
      </select>
    `}_render_equipment_filter(e){let t=Le(e);return t.length<=1?P``:P`
      <select
        class="maint-equip-select"
        @change="${e=>{let t=e.currentTarget.value;this._filter_device=t===``?null:t}}"
      >
        <option value="" ?selected="${this._filter_device===null}">
          ${this._t(`maintenance_all_equipment`)}
        </option>
        ${t.map(e=>P`
            <option
              value="${e.id}"
              ?selected="${this._filter_device===e.id}"
            >
              ${this._device_label(e.name,e.pump_type,e.pump_model)}
              (${e.count})
            </option>
          `)}
      </select>
    `}_render_toolbar(e,t){return P`
      <div class="maint-toolbar">
        <div class="maint-toolbar-left">
          <div class="maint-sort">
            <button
              id="sort-device"
              class="${this._sort===`device`?`active`:``}"
              @click="${()=>this._sort=`device`}"
            >
              ${this._t(`sort_by_equipment`)}
            </button>
            <button
              id="sort-due"
              class="${this._sort===`due`?`active`:``}"
              @click="${()=>this._sort=`due`}"
            >
              ${this._t(`sort_by_due_date`)}
            </button>
          </div>
          ${this._render_location_filter(e)}
          ${this._render_equipment_filter(t)}
        </div>
        <div class="maint-filters">
          <label class="maint-filter">
            <input
              id="hide-ok"
              type="checkbox"
              .checked="${this._hide_ok}"
              @change="${()=>this._hide_ok=!this._hide_ok}"
            />
            ${this._t(`maintenance_hide_ok`)}
          </label>
          <button
            id="hide-muted"
            class="maint-mute-filter ${this._hide_muted?`active`:``}"
            title="${this._hide_muted?this._t(`maintenance_show_muted`):this._t(`maintenance_hide_muted`)}"
            @click="${()=>this._hide_muted=!this._hide_muted}"
          >
            <ha-icon
              icon="${this._hide_muted?`mdi:bell-off-outline`:`mdi:bell`}"
            ></ha-icon>
            <span>
              ${this._hide_muted?this._t(`maintenance_show_muted`):this._t(`maintenance_hide_muted`)}
            </span>
          </button>
        </div>
      </div>
    `}_render_row(e,t,n){let r=e.status===`overdue`?100:e.percent;return P`
      <div class="maint-entry">
        <div
          class="maint-row ${e.notify?``:`muted`}"
          title="${this._row_title(e)}"
        >
          <ha-icon
            class="maint-icon"
            icon="${e.icon||`mdi:wrench-check`}"
          ></ha-icon>
          <div
            class="maint-body"
            @click="${()=>this._more_info(e)}"
            @keydown="${t=>{t.key===`Enter`&&this._more_info(e)}}"
          >
            <div class="maint-line">
              <span class="maint-name">
                ${e.name}
                ${e.regulatory?P`<ha-icon
                      class="maint-regulatory"
                      icon="mdi:scale-balance"
                      title="${this._t(`maintenance_regulatory`)}"
                    ></ha-icon>`:``}
                ${n?P`<span class="maint-device"> - ${n}</span>`:``}
              </span>
              <span class="maint-remaining ${e.status}">
                ${this._remaining_label(e)}
              </span>
            </div>
            <div class="maint-bar">
              <div
                class="maint-bar-fill ${e.status}"
                style="width: ${r}%"
              ></div>
            </div>
          </div>
          ${t.show_interval&&e.frequency?P`<button
                class="maint-tune ${this._editing===e.entity_id?`open`:``}"
                title="${this._t(`maintenance_edit_interval`)}"
                @click="${()=>this._toggle_editor(e)}"
              >
                <ha-icon icon="mdi:calendar-edit"></ha-icon>
              </button>`:``}
          ${t.show_notify&&e.can_notify?P`<button
                class="maint-bell ${e.notify?`on`:`off`}"
                title="${e.notify?this._t(`maintenance_mute`):this._t(`maintenance_unmute`)}"
                @click="${()=>this._toggle_notify(e)}"
              >
                <ha-icon
                  icon="${e.notify?`mdi:bell-ring`:`mdi:bell-off`}"
                ></ha-icon>
              </button>`:``}
          ${t.show_reset?P`<button
                class="maint-done"
                title="${this._t(`maintenance_mark_done`)}"
                @click="${()=>this._mark_done(e)}"
              >
                <ha-icon icon="mdi:check"></ha-icon>
              </button>`:``}
        </div>
        ${this._editing===e.entity_id?this._render_editor(e):``}
      </div>
    `}_render_editor(e){let t=e.frequency;return t?.mode===`slider`?this._render_slider_editor(e,t):this._render_free_editor(e)}_render_slider_editor(e,t){let n=this._unit_label(t.unit);return P`
      <div class="maint-editor">
        <div class="maint-editor-line">
          <span class="maint-editor-label">
            ${this._t(`maintenance_every`)}
          </span>
          <span class="maint-editor-value">${t.value} ${n}</span>
        </div>
        <div class="maint-editor-line">
          <span class="maint-editor-bound">${t.min}</span>
          <input
            class="maint-slider"
            type="range"
            min="${t.min}"
            max="${t.max}"
            step="${t.step}"
            .value="${String(t.value)}"
            @change="${t=>this._set_slider(e,Number(t.target.value))}"
          />
          <span class="maint-editor-bound">${t.max}</span>
        </div>
      </div>
    `}_render_free_editor(e){let t=this._draft;if(!t)return P``;let n=this._month_names();return P`
      <div class="maint-editor">
        <div class="maint-editor-line maint-editor-free">
          <span class="maint-editor-label">
            ${this._t(`maintenance_every`)}
          </span>
          <input
            class="maint-value"
            type="number"
            min="1"
            max="999"
            .value="${String(t.value)}"
            @input="${e=>this._update_draft({value:Number(e.target.value)||1})}"
          />
          <select
            class="maint-unit"
            @change="${e=>this._update_draft({unit:e.target.value})}"
          >
            ${Ce.map(e=>P`<option value="${e}" ?selected="${e===t.unit}">
                  ${this._unit_label(e)}
                </option>`)}
          </select>
        </div>
        ${t.unit===`years`?P`<div class="maint-editor-line maint-editor-free">
              <label class="maint-editor-seasonal">
                <input
                  class="maint-seasonal"
                  type="checkbox"
                  .checked="${t.seasonal}"
                  @change="${e=>this._update_draft({seasonal:e.target.checked})}"
                />
                ${this._t(`maintenance_seasonal`)}
              </label>
              ${t.seasonal?P`<input
                      class="maint-day"
                      type="number"
                      min="1"
                      max="${at(t.month)}"
                      .value="${String(t.day)}"
                      @input="${e=>this._update_draft({day:Number(e.target.value)||1})}"
                    />
                    <select
                      class="maint-month"
                      @change="${e=>this._update_draft({month:Number(e.target.value)})}"
                    >
                      ${n.map((e,n)=>P`<option
                            value="${n+1}"
                            ?selected="${n+1===t.month}"
                          >
                            ${e}
                          </option>`)}
                    </select>`:``}
            </div>`:``}
        ${t.seasonal&&t.unit===`years`?P`<div class="maint-editor-hint">
              ${this._t(`maintenance_seasonal_hint`)}
            </div>`:``}
        <div class="maint-editor-actions">
          <button
            class="maint-cancel"
            @click="${()=>this._toggle_editor(e)}"
          >
            ${this._t(`maintenance_cancel`)}
          </button>
          <button
            class="maint-apply primary"
            @click="${()=>this._apply_draft(e)}"
          >
            ${this._t(`maintenance_apply`)}
          </button>
        </div>
      </div>
    `}_render_groups(e,t){return P`${e.map(e=>P`
        <div class="maint-group-title">
          ${this._device_label(e.device_name,e.pump_type,e.pump_model)}
        </div>
        ${e.items.map(e=>this._render_row(e,t,``))}
      `)}`}_render_list(e,t){if(e.length===0)return P`<div class="maint-empty">
        ${this._hide_ok?this._t(`maintenance_all_ok`):this._t(`maintenance_no_task`)}
      </div>`;let n=J(e).length>1;return this._sort===`due`?P`${e.map(e=>{let r=this._device_label(e.device_name,e.pump_type,e.pump_model),i=n&&e.location_name?`${r} · ${e.location_name}`:r;return this._render_row(e,t,i)})}`:n?P`${Ie(e).map(e=>P`
        <div class="maint-location-title">
          <ha-icon icon="mdi:map-marker-outline"></ha-icon>
          ${e.location_name}
        </div>
        ${this._render_groups(e.groups,t)}
      `)}`:this._render_groups(Fe(e),t)}render(){let e=this.view_options,t=this.collect(e);this._signature=Ve(t);let n=t;if(this._filter_location!==null){let e=t.filter(e=>e.location_id===this._filter_location);e.length>0?n=e:this._filter_location=null}let r=n;if(this._filter_device!==null){let e=n.filter(e=>e.device_id===this._filter_device);e.length>0?r=e:this._filter_device=null}let i=this._hide_ok?r.filter(e=>e.status!==`ok`):r;this._hide_muted&&(i=i.filter(e=>e.notify));let a=Pe(i,this._sort);return P`
      <div class="maint-root ${e.embedded?`embedded`:``}">
        <div class="maint-header">
          ${e.embedded?``:P`<div class="maint-title">
                <ha-icon icon="mdi:wrench-clock"></ha-icon>
                ${e.title||this._t(`maintenance_view`)}
              </div>`}
          ${this._render_counters(t)}
        </div>
        ${this._render_toolbar(t,n)} ${this._render_list(a,e)}
      </div>
    `}};function ct(e=`maintenance-view`){return customElements.get(e)||customElements.define(e,class extends st{}),e}function lt(e){return{sort:e.sort,locations:e.locations,devices:e.devices,hide_ok:e.hide_ok,hide_muted:e.hide_muted,warning_ratio:e.warning_ratio,show_reset:e.show_reset,show_notify:e.show_notify,show_interval:e.show_interval,title:e.title,default_location:e.reef_location}}function ut(e){return e.include_reef===!1?[rt]:[rt,$e]}var Z=`maintenance-hub-card`,dt=`maintenance-hub-card-editor`,ft=`v0.1.0`,Q={hide_ok:!1,hide_muted:!1,show_reset:!0,show_notify:!0,show_interval:!0,include_reef:!0},pt=class extends U{static properties={hass:{attribute:!1},_config:{state:!0}};static styles=[it,o`
      .maint-editor-form table {
        width: 100%;
      }
      .editor-text {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .editor-text input,
      .editor-text select {
        background: transparent;
        border: 1px solid var(--maint-divider);
        border-radius: 8px;
        color: var(--maint-text);
        font-family: inherit;
        font-size: 1em;
        padding: 6px 8px;
      }
      .editor-text select option {
        color: initial;
      }
    `];constructor(){super(),this.hass=null,this._config=null}setConfig(e){this._config={...e}}get _lang(){return We(this.hass)}_t(e){return Ge(e,this._lang)}_update(e,t){if(!this._config)return;let n={...this._config,[e]:t};(t===``||Array.isArray(t)&&t.length===0||e in Q&&Q[e]===t||e===`sort`&&t===`device`)&&delete n[e],this._config=n,this.dispatchEvent(new CustomEvent(`config-changed`,{detail:{config:this._config},bubbles:!0,composed:!0}))}_bool(e){let t=this._config?.[e];return typeof t==`boolean`?t:Q[e]}_render_toggle(e,t){return P`
      <tr>
        <td>
          <label class="switch">
            <input
              type="checkbox"
              id="${e}"
              .checked="${this._bool(e)}"
              @change="${t=>this._update(e,t.currentTarget.checked)}"
            />
            <span class="slider round"></span>
          </label>
          <label for="${e}">${t}</label>
        </td>
      </tr>
    `}_toggle_location(e,t){let n=(this._config?.locations??[]).filter(t=>t!==e);t&&n.push(e),this._update(`locations`,n)}_render_locations(e){let t=J(je(He(ut(e),this.hass),e.reef_location||this._t(`maintenance_reef_location`)));if(t.length===0)return P`<div class="maint-empty">${this._t(`editor_no_location`)}</div>`;let n=e.locations??[];return P`
      <div class="maint-devices">
        ${t.map(e=>P`
            <label class="maint-device-option">
              <input
                type="checkbox"
                .checked="${n.includes(e.id)||n.includes(e.name)}"
                @change="${t=>this._toggle_location(e.id,t.currentTarget.checked)}"
              />
              <span class="maint-device-name">${e.name}</span>
              <span class="maint-device-count">${e.count}</span>
            </label>
          `)}
      </div>
      <div class="maint-devices-hint">
        ${n.length===0?this._t(`editor_locations_hint`):P`<button
              class="maint-devices-clear"
              @click="${()=>this._update(`locations`,[])}"
            >
              ${this._t(`maintenance_all_locations`)}
            </button>`}
      </div>
    `}render(){let e=this._config;return e?P`
      <form class="maint-editor-form" @submit="${e=>e.preventDefault()}">
        <table>
          <tr>
            <td class="editor-text">
              <label for="title">${this._t(`editor_title`)}</label>
              <input
                id="title"
                type="text"
                .value="${e.title??``}"
                placeholder="${this._t(`maintenance_view`)}"
                @change="${e=>this._update(`title`,e.currentTarget.value)}"
              />
            </td>
          </tr>
          <tr>
            <td class="editor-text">
              <label for="sort">${this._t(`editor_sort_default`)}</label>
              <select
                id="sort"
                @change="${e=>this._update(`sort`,e.currentTarget.value)}"
              >
                <option value="device" ?selected="${e.sort!==`due`}">
                  ${this._t(`sort_by_equipment`)}
                </option>
                <option value="due" ?selected="${e.sort===`due`}">
                  ${this._t(`sort_by_due_date`)}
                </option>
              </select>
            </td>
          </tr>
          ${this._render_toggle(`hide_ok`,this._t(`maintenance_hide_ok_default`))}
          ${this._render_toggle(`hide_muted`,this._t(`maintenance_hide_muted_default`))}
          ${this._render_toggle(`show_reset`,this._t(`editor_show_reset`))}
          ${this._render_toggle(`show_notify`,this._t(`editor_show_notify`))}
          ${this._render_toggle(`show_interval`,this._t(`editor_show_interval`))}
          ${this._render_toggle(`include_reef`,this._t(`editor_include_reef`))}
          ${this._bool(`include_reef`)?P`<tr>
                <td class="editor-text">
                  <label for="reef_location">${this._t(`editor_reef_location`)}</label>
                  <input
                    id="reef_location"
                    type="text"
                    .value="${e.reef_location??``}"
                    placeholder="${this._t(`maintenance_reef_location`)}"
                    @change="${e=>this._update(`reef_location`,e.currentTarget.value)}"
                  />
                </td>
              </tr>`:``}
          <tr>
            <td>
              <label class="maint-devices-title">${this._t(`editor_locations`)}</label>
              ${this._render_locations(e)}
            </td>
          </tr>
        </table>
      </form>
    `:P``}};customElements.get(`maintenance-hub-card-editor`)||customElements.define(dt,pt);var mt=ct(`maintenance-hub-view`),$=class extends U{static properties={hass:{attribute:!1},_config:{state:!0}};static styles=o`
    ha-card {
      padding: 4px 12px;
    }
  `;_options={};_backends=[];constructor(){super(),this.hass=null,this._config=null}setConfig(e){if(!e||typeof e!=`object`)throw Error(`Invalid configuration`);this._config={...e},this._options=lt(this._config),this._backends=ut(this._config)}getCardSize(){return 6}getGridOptions(){return{columns:12,min_columns:6,rows:6}}static getConfigElement(){return document.createElement(dt)}static getStubConfig(){return{type:`custom:${Z}`,include_reef:!0}}render(){return this._config?P`
      <ha-card>
        <maintenance-hub-view
          .hass=${this.hass}
          .backends=${this._backends}
          .options=${this._options}
        ></maintenance-hub-view>
      </ha-card>
    `:P``}};customElements.get(`maintenance-hub-card`)||customElements.define(Z,$),window.customCards=window.customCards||[],window.customCards.some(e=>e.type===`maintenance-hub-card`)||window.customCards.push({type:Z,name:`Maintenance Hub`,description:`Maintenance tasks of your home, pool, heating and aquarium`,preview:!0,documentationURL:`https://github.com/Elwinmage/ha-maintenance-hub`}),console.info(`%c MAINTENANCE-HUB-CARD %c ${ft} `,`color:white;background:#03a9f4`,``);export{$ as MaintenanceHubCard,mt as VIEW_TAG};