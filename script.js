const USERS_KEY="runtrack_users";const SESSION_KEY="runtrack_session";const RUNS_KEY="runtrack_runs";
const $=id=>document.getElementById(id);
const today=()=>new Date().toISOString().slice(0,10);
function users(){return JSON.parse(localStorage.getItem(USERS_KEY)||"[]")}
function saveUsers(v){localStorage.setItem(USERS_KEY,JSON.stringify(v))}
function session(){return JSON.parse(localStorage.getItem(SESSION_KEY)||"null")}
function setMsg(id,text,error=false){$(id).textContent=text;$(id).style.color=error?"#dc2626":"#15803d"}
function runs(){return JSON.parse(localStorage.getItem(RUNS_KEY)||"[]")}
function saveRuns(v){localStorage.setItem(RUNS_KEY,JSON.stringify(v))}
function currentUser(){const s=session();return s?users().find(u=>u.email===s.email):null}
function pace(distance,duration){return distance>0&&duration>0?duration/distance:null}
function paceText(p){if(p===null)return "-";let m=Math.floor(p),s=Math.round((p-m)*60);if(s===60){m++;s=0}return `${m}:${String(s).padStart(2,"0")}`}
function showAuth(tab){
  document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.auth===tab));
  ["login","register","forgot"].forEach(x=>$(`${x}Form`).classList.toggle("hidden",x!==tab));
}
document.querySelectorAll(".tab").forEach(x=>x.onclick=()=>showAuth(x.dataset.auth));
$("registerForm").onsubmit=e=>{e.preventDefault();let name=$("regName").value.trim(),email=$("regEmail").value.trim().toLowerCase(),password=$("regPassword").value;
  if(password.length<8)return setMsg("registerMsg","Password minimal 8 karakter.",true);
  let u=users();if(u.some(x=>x.email===email))return setMsg("registerMsg","Email sudah terdaftar.",true);
  u.push({name,email,password});saveUsers(u);setMsg("registerMsg","Akun berhasil dibuat. Silakan login.");$("registerForm").reset();setTimeout(()=>showAuth("login"),700);
};
$("loginForm").onsubmit=e=>{e.preventDefault();let email=$("loginEmail").value.trim().toLowerCase(),password=$("loginPassword").value,u=users(),found=u.find(x=>x.email===email&&x.password===password);
  if(!found)return setMsg("loginMsg","Email atau password salah.",true);
  localStorage.setItem(SESSION_KEY,JSON.stringify({email}));loadApp();
};
$("forgotForm").onsubmit=e=>{e.preventDefault();let email=$("forgotEmail").value.trim().toLowerCase();if(!users().some(x=>x.email===email))return setMsg("forgotMsg","Email tidak ditemukan.",true);setMsg("forgotMsg","Link reset password simulasi telah dikirim ke email.");};
$("logoutBtn").onclick=()=>{localStorage.removeItem(SESSION_KEY);location.reload()};
$("openRunBtn").onclick=()=>openModal();
$("closeModal").onclick=()=>closeModal();
$("runDistance").oninput=$("runDuration").oninput=()=>updatePace();
function updatePace(){let d=Number($("runDistance").value),t=Number($("runDuration").value);$("pacePreview").textContent=paceText(pace(d,t))}
function openModal(id=null){$("runModal").classList.remove("hidden");$("runMsg").textContent="";$("runForm").reset();$("runDate").value=today();$("runId").value="";
  $("modalTitle").textContent=id?"Edit Aktivitas":"Catat Lari";
  if(id){let r=runs().find(x=>x.id===id);if(!r)return;$("runId").value=r.id;$("runDate").value=r.date;$("runDistance").value=r.distance;$("runDuration").value=r.duration;$("runNote").value=r.note||"";updatePace();}
}
function closeModal(){$("runModal").classList.add("hidden")}
$("runForm").onsubmit=e=>{e.preventDefault();let d=Number($("runDistance").value),t=Number($("runDuration").value);
  if(d<=0||t<=0)return setMsg("runMsg","Jarak dan durasi harus lebih dari 0.",true);
  let all=runs(),id=$("runId").value;
  if(id){let i=all.findIndex(x=>x.id===id&&x.email===currentUser().email);if(i<0)return setMsg("runMsg","Aktivitas tidak ditemukan.",true);all[i]={...all[i],date:$("runDate").value,distance:d,duration:t,note:$("runNote").value.trim()};}
  else all.push({id:crypto.randomUUID(),email:currentUser().email,date:$("runDate").value,distance:d,duration:t,note:$("runNote").value.trim(),createdAt:new Date().toISOString()});
  saveRuns(all);closeModal();render();
};
function deleteRun(id){if(!confirm("Hapus aktivitas ini?"))return;saveRuns(runs().filter(r=>!(r.id===id&&r.email===currentUser().email)));render()}
function render(){let me=currentUser();if(!me)return;let mine=runs().filter(r=>r.email===me.email).sort((a,b)=>b.date.localeCompare(a.date));
  let q=$("searchInput").value.trim().toLowerCase(),date=$("dateFilter").value,df=$("distanceFilter").value;
  let filtered=mine.filter(r=>(!q||(r.note||"").toLowerCase().includes(q)||r.date.includes(q))&&(!date||r.date===date)&&
    (df==="all"||(df==="short"&&r.distance<5)||(df==="medium"&&r.distance>=5&&r.distance<=10)||(df==="long"&&r.distance>10)));
  $("totalRuns").textContent=mine.length;$("totalDistance").textContent=mine.reduce((s,r)=>s+r.distance,0).toFixed(2)+" km";
  $("totalDuration").textContent=mine.reduce((s,r)=>s+r.duration,0)+" mnt";
  let avg=mine.length?mine.reduce((s,r)=>s+r.duration,0)/mine.reduce((s,r)=>s+r.distance,0):null;$("avgPace").textContent=paceText(avg)+" /km";
  $("runList").innerHTML=filtered.length?filtered.map(r=>`<div class="run-item">
    <div><div class="label">Tanggal</div><div class="value">${r.date}</div></div>
    <div><div class="label">Jarak</div><div class="value">${r.distance.toFixed(2)} km</div></div>
    <div><div class="label">Durasi</div><div class="value">${r.duration} mnt</div></div>
    <div><div class="label">Pace</div><div class="value">${paceText(pace(r.distance,r.duration))}</div></div>
    <div><div class="label">Catatan</div><div class="value">${escapeHtml(r.note||"-")}</div></div>
    <div class="actions"><button class="small" onclick="openModal('${r.id}')">Edit</button><button class="small danger" onclick="deleteRun('${r.id}')">Hapus</button></div>
  </div>`).join(""):`<div class="empty">Belum ada aktivitas yang sesuai filter.</div>`;
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
["searchInput","dateFilter","distanceFilter"].forEach(id=>$(id).addEventListener("input",render));
function loadApp(){let me=currentUser();if(!me){$("authView").classList.remove("hidden");$("appView").classList.add("hidden");return}
  $("authView").classList.add("hidden");$("appView").classList.remove("hidden");$("runnerName").textContent=me.name;$("welcomeUser").textContent=me.email;render()}
loadApp();
