var e=Object.defineProperty,a=Object.defineProperties,t=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,s=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,r=(a,t,o)=>t in a?e(a,t,{enumerable:!0,configurable:!0,writable:!0,value:o}):a[t]=o,n=(e,a)=>{for(var t in a||(a={}))s.call(a,t)&&r(e,t,a[t]);if(o)for(var t of o(a))c.call(a,t)&&r(e,t,a[t]);return e},i=(e,o)=>a(e,t(o));import{p as l,a as d,o as m,c as p,r as u,b as k,w as b,F as g,k as v,d as w,e as y,t as h,f,g as C,u as j,h as x,_ as S,i as _,j as K,l as I,m as L,n as W,q as N,s as A,v as P}from"./vendor.a76913d8.js";l("data-v-9fbf088c"),d();const V={},Q={class:"NinjaLogo",src:"/assets/logo.03d6d6da.png",alt:"logo"};V.render=function(e,a){return m(),p("img",Q)};const R={components:{Logo:V}},O=b("data-v-7fe153b3");l("data-v-7fe153b3");const D={class:"header"},U={class:"header-wrapper"},z={class:"flex items-center"},T=k("p",{class:"pl-3 select-none"},"Ninja",-1);d();const q=O(((e,a,t,o,s,c)=>{const r=u("Logo");return m(),p("div",D,[k("div",U,[k("div",z,[k(r,{class:"h-10 w-10"}),T])])])}));R.render=q,R.__scopeId="data-v-7fe153b3";const J={class:"main"},$={setup:e=>(e,a)=>{const t=u("router-view");return m(),p(g,null,[k(R),k("div",J,[k(t)])],64)}};const E=v.create({prefixUrl:"/api",retry:{limit:0}});function B(e){return E.post("cklogin",{json:e}).json()}function F(e){return E.post("WSCKLogin",{json:e}).json()}const H={setup(){const e=j();x();let a=w({remark:"",jdwsck:void 0,nickName:void 0,timestamp:void 0,userStatus:void 0});const t=async()=>{try{const e=localStorage.getItem("eid"),t=localStorage.getItem("wseid");if(!e&&!t)return void o();if(e){const t=await function(e){const a=new URLSearchParams;return a.set("eid",e),E.get("userinfo",{searchParams:a}).json()}(e);if(!t)return S.error("获取用户CK信息失败，请重重新登录"),void o();a.nickName=t.data.nickName,a.userStatus=t.data.status,a.timestamp=new Date(t.data.timestamp).toLocaleString()}if(t){const e=await getWSCKUserinfoAPI(t);if(!e)return S.error("获取用户WSCK信息失败，请重重新登录"),void o();a.nickName=e.data.nickName,a.timestamp=new Date(e.data.timestamp).toLocaleString()}}catch(e){console.error(e)}};y(t);const o=()=>{localStorage.removeItem("eid"),localStorage.removeItem("wseid"),e.push("/login")};return i(n({},h(a)),{getInfo:t,logout:o,delAccount:async()=>{try{const e=localStorage.getItem("eid"),a=await function(e){return E.post("delaccount",{json:e}).json()}({eid:e});200!==a.code?S.error(a.message):(S.success(a.message),setTimeout((()=>{o()}),1e3))}catch(e){console.error(e)}},changeremark:async()=>{try{const t=localStorage.getItem("eid"),o=localStorage.getItem("wseid"),s=a.remark;if(t){const e=await function(e){return E.post("update/remark",{json:e}).json()}({eid:t,remark:s});200!==e.code?S.success(e.message):S.error(e.message)}if(o){const a=await(e={wseid:o,remark:s},E.post("updateWSCK/remark",{json:e}).json());200!==a.code?S.success(a.message):S.error(a.message)}}catch(t){console.error(t)}var e},WSCKLogin:async()=>{try{const e=a.jdwsck.match(/wskey=(.*?);/)&&a.jdwsck.match(/wskey=(.*?);/)[1],t=a.jdwsck.match(/pin=(.*?);/)&&a.jdwsck.match(/pin=(.*?);/)[1];if(e&&t){const a=await F({wskey:e,pin:t});a.data.wseid?(localStorage.setItem("wseid",a.data.wseid),S.success(a.message)):S.error(a.message||"wskey 解析失败，请检查后重试！")}else S.error("wskey 解析失败，请检查后重试！")}catch(e){console.error(e)}},delWSCKAccount:async()=>{try{const e=localStorage.getItem("wseid"),a=await function(e){return E.post("WSCKDelaccount",{json:e}).json()}({wseid:e});200!==a.code?S.error(a.message):(S.success(a.message),setTimeout((()=>{o()}),1e3))}catch(e){console.error(e)}},openUrlWithJD:e=>{const a=encodeURIComponent(`{"category":"jump","des":"m","action":"to","url":"${e}"}`);window.location.href=`openapp.jdmobile://virtual?params=${a}`,console.log(window.location.href)}})}},Z=b("data-v-066736aa");l("data-v-066736aa");const G={class:"content"},M={class:"card"},X=k("div",{class:"card-header"},[k("p",{class:"card-title"},"个人中心")],-1),Y={class:"card-body"},ee=_("状态："),ae={key:0,style:{color:"red",display:"inline"}},te={key:1,style:{color:"green",display:"inline"}},oe={class:"card-footer"},se=_("退出登录"),ce=_("删除CK"),re={class:"card"},ne=k("div",{class:"card-header"},[k("p",{class:"card-title"},"修改备注")],-1),ie={class:"card-body text-center"},le={class:"card-footer"},de=_("修改");d();const me=Z(((e,a,t,o,s,c)=>{const r=u("el-button"),n=u("el-input");return m(),p("div",G,[k("div",M,[X,k("div",Y,[k("p",null,"昵称："+f(e.nickName),1),k("p",null,"更新时间："+f(e.timestamp),1),k("span",null,[ee,1===e.userStatus?(m(),p("p",ae,"过期已禁用")):C("",!0),0===e.userStatus?(m(),p("p",te,"正常")):C("",!0)])]),k("div",oe,[k(r,{size:"small",auto:"",onClick:o.logout},{default:Z((()=>[se])),_:1},8,["onClick"]),k(r,{type:"danger",size:"small",auto:"",onClick:o.delAccount},{default:Z((()=>[ce])),_:1},8,["onClick"])])]),k("div",re,[ne,k("div",ie,[k(n,{modelValue:e.remark,"onUpdate:modelValue":a[1]||(a[1]=a=>e.remark=a),size:"small",clearable:"",class:"my-4 w-full"},null,8,["modelValue"])]),k("div",le,[k(r,{type:"success",size:"small",auto:"",onClick:o.changeremark},{default:Z((()=>[de])),_:1},8,["onClick"])])])])}));H.render=me,H.__scopeId="data-v-066736aa";const pe={setup(){const e=j();x();let a=w({marginCount:0,allowAdd:!0,cookie:"",QRCode:void 0,qrCodeVisibility:!1,token:void 0,okl_token:void 0,cookies:void 0,timer:void 0,waitLogin:!1,marginWSCKCount:0,allowWSCKAdd:!0,jdwsck:void 0,showQR:!1,showWSCK:!1,showCK:!0,nickName:void 0});const t=async()=>{try{const e=(await E.get("info").json()).data;a.marginCount=e.marginCount,a.allowAdd=e.allowAdd,a.marginWSCKCount=e.marginWSCKCount,a.allowWSCKAdd=e.allowWSCKAdd,a.showQR=e.showQR,a.showWSCK=e.showWSCK,a.showCK=e.showCK}catch(e){console.error(e)}},o=async()=>{if(this.showQR)try{const e=await E.get("qrcode").json();a.token=e.data.token,a.okl_token=e.data.okl_token,a.cookies=e.data.cookies,a.QRCode=e.data.QRCode,a.QRCode&&(a.waitLogin=!0,clearInterval(a.timer),a.timer=setInterval(s,3e3))}catch(e){console.error(e),S.error("生成二维码失败！请重试或放弃")}else S.warning("扫码已禁用请手动抓包")},s=async()=>{try{const t=await function(e){return E.post("check",{json:e}).json()}({token:a.token,okl_token:a.okl_token,cookies:a.cookies});switch(null==t?void 0:t.data.errcode){case 0:localStorage.setItem("eid",t.data.eid),S.success(t.message),clearInterval(a.timer),e.push("/");break;case 176:break;default:S.error(t.message),a.waitLogin=!1,clearInterval(a.timer)}}catch(t){clearInterval(a.timer),a.waitLogin=!1}};return y((()=>{t(),o()})),i(n({},h(a)),{getInfo:t,getQrcode:o,showQrcode:async()=>{a.qrCodeVisibility=!0},ckeckLogin:s,jumpLogin:async()=>{const e=`openapp.jdmobile://virtual/ad?params={"category":"jump","des":"ThirdPartyLogin","action":"to","onekeylogin":"return","url":"https://plogin.m.jd.com/cgi-bin/m/tmauth?appid=300&client_type=m&token=${a.token}","authlogin_returnurl":"weixin://","browserlogin_fromurl":"${window.location.host}"}`;window.location.href=e},CKLogin:async()=>{try{const t=a.cookie.match(/pt_key=(.*?);/)&&a.cookie.match(/pt_key=(.*?);/)[1],o=a.cookie.match(/pt_pin=(.*?);/)&&a.cookie.match(/pt_pin=(.*?);/)[1];if(t&&o){let s;a.nickName?(s=await B({pt_key:t,pt_pin:o,nickName:a.nickName}),s.data.eid?(localStorage.setItem("eid",s.data.eid),S.success(s.message),e.push("/")):S.error(s.message||"cookie 解析失败，请检查后重试！")):K.confirm("建议填写具有辨识度的备注，以方便查看运行日志！","提示",{confirmButtonText:"返回填写备注",cancelButtonText:"我不管，就用默认的！"}).then((()=>{})).catch((async()=>{try{s=await B({pt_key:t,pt_pin:o}),s.data.eid?(localStorage.setItem("eid",s.data.eid),S.success(s.message),e.push("/")):S.error(s.message||"cookie 解析失败，请检查后重试！")}catch(a){console.error(a)}}))}else S.error("cookie 解析失败，请检查后重试！")}catch(t){console.error(t)}},WSCKLogin:async()=>{try{const t=a.jdwsck.match(/wskey=(.*?);/)&&a.jdwsck.match(/wskey=(.*?);/)[1],o=a.jdwsck.match(/pin=(.*?);/)&&a.jdwsck.match(/pin=(.*?);/)[1];if(t&&o){const a=await F({wskey:t,pin:o});a.data.wseid?(localStorage.setItem("wseid",a.data.wseid),S.success(a.message),e.push("/")):S.error(a.message||"wskey 解析失败，请检查后重试！")}else S.error("wskey 解析失败，请检查后重试！")}catch(t){console.error(t)}}})}},ue=b("data-v-3bc9e57b");l("data-v-3bc9e57b");const ke={class:"content"},be=I('<div class="card" data-v-3bc9e57b><div class="card-header" data-v-3bc9e57b><div class="flex items-center justify-between" data-v-3bc9e57b><p class="card-title" data-v-3bc9e57b>Ninja提醒您</p></div></div><div class="card-body text-base leading-6" data-v-3bc9e57b><p style="color:red;" data-v-3bc9e57b>撸豆有可能造成的任何损失本人概不负责！！！！！！！！！</p><p data-v-3bc9e57b>为了您的财产安全请关闭免密支付以及打开支付验密（京东-设置-支付设置-支付验密设置）。</p><p data-v-3bc9e57b>建议京东账户绑定微信以保证提现能到账。</p><p style="font-weight:bold;" data-v-3bc9e57b>安全起见，切勿泄露您的cookie！</p></div><div class="card-footet" data-v-3bc9e57b></div></div>',1),ge={key:0,class:"card"},ve={class:"card-header"},we={class:"flex items-center justify-between"},ye=k("p",{class:"card-title"},"CK 登录",-1),he={class:"ml-2 px-2 py-1 bg-gray-200 rounded-full font-normal text-xs"},fe=I('<div class="card-body text-base leading-6" data-v-3bc9e57b><p data-v-3bc9e57b>安卓手机傻瓜式获取CK（强烈推荐，非常方便）<a style="" href="https://github.com/ZhuSky/JDCookie" target="_blank" data-v-3bc9e57b>点此访问下载连接</a></p><p data-v-3bc9e57b>电脑用户浏览器登录<a style="" href="https://m.jd.com/" target="_blank" data-v-3bc9e57b>JD官网</a>，点击我的出现登录页面后点击F12，通过开发者工具获取cookie。</p><p data-v-3bc9e57b>手机用户可以使用Alook浏览器登录<a style="" href="https://m.jd.com/" target="_blank" id="jd" data-v-3bc9e57b>JD官网</a>，并在菜单-工具箱-开发者工具-Cookies中获取（Android和iPhone通用）。</p><p data-v-3bc9e57b>另外也可以使用抓包工具（iPhone：Stream，Android：HttpCanary）抓取京东app的ck</p><p data-v-3bc9e57b>cookie直接填入输入框即可，Ninja会自动正则提取pt_key和pt_pin。</p></div><span class="card-subtitle" style="color:red;" data-v-3bc9e57b> 可以直接填写整个cookie。 </span><br data-v-3bc9e57b><span class="card-subtitle" style="color:red;" data-v-3bc9e57b> 注意格式（pt_key=xxxxxxxxxxxxxxx;pt_pin=xxxxxxxxxxxxxx;）注意分号不能少！ </span><br data-v-3bc9e57b><span class="card-subtitle" data-v-3bc9e57b> 请在下方输入您的 cookie 登录。 </span><br data-v-3bc9e57b>',7),Ce={class:"card-body text-center"},je=_("登录"),xe=k("div",{class:"card-footet"},null,-1);d();const Se=ue(((e,a,t,o,s,c)=>{const r=u("el-input"),n=u("el-button");return m(),p("div",ke,[be,e.showCK?(m(),p("div",ge,[k("div",ve,[k("div",we,[ye,k("span",he,"余量："+f(e.marginCount),1)]),fe]),k("div",Ce,[k(r,{modelValue:e.nickName,"onUpdate:modelValue":a[1]||(a[1]=a=>e.nickName=a),size:"small",style:{width:"300px",float:"left"},placeholder:"备注",clearable:""},null,8,["modelValue"]),k(r,{modelValue:e.cookie,"onUpdate:modelValue":a[2]||(a[2]=a=>e.cookie=a),size:"small",placeholder:"Cookie",clearable:"",class:"my-4 w-full"},null,8,["modelValue"]),k(n,{type:"primary",size:"small",round:"",onClick:o.CKLogin},{default:ue((()=>[je])),_:1},8,["onClick"])]),xe])):C("",!0)])}));pe.render=Se,pe.__scopeId="data-v-3bc9e57b";const _e=[{path:"/",component:H},{path:"/login",component:pe}],Ke=L({history:W(),routes:_e}),Ie=[A,P,S,K],Le=[S],We=N($);Ie.forEach((e=>{We.component(e.name,e)})),Le.forEach((e=>{We.use(e)})),We.use(Ke),We.mount("#app");
