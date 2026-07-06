// ============================================================
// POSTA MÉDICA — Frontend conectado al backend Spring Boot
// ============================================================
const API_BASE = "http://localhost:8080";
 
const DAYS = ["Lunes","Martes","Miercoles","Jueves","Viernes","Sabado","Domingo"];
const DAY_MAP = { Lunes:"LUNES",Martes:"MARTES",Miercoles:"MIERCOLES",Jueves:"JUEVES",Viernes:"VIERNES",Sabado:"SABADO",Domingo:"DOMINGO" };
const HOURS = ["Seleccione","07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00"];
 
const NAV = {
  ADMINISTRADOR:[["dashboard","📊 Dashboard"],["usuarios","👥 Usuarios"],["medicos","🩺 Médicos"],["especialidades","🏥 Especialidades"],["horarios","🕐 Horarios"],["citas","📋 Citas"],["reportes","📈 Reportes"]],
  MEDICO:[["dashboard","📊 Dashboard"],["agenda","📅 Agenda de hoy"],["historial","📁 Historial"],["horarios","🕐 Mis horarios"],["reportes","📈 Reportes"]],
  PACIENTE:[["dashboard","📊 Dashboard"],["registrar-cita","➕ Registrar cita"],["mis-citas","📋 Mis citas"],["historial","📁 Mi historial"],["cancelar","❌ Cancelar cita"]]
};
 
// Normaliza cualquier variante del rol que devuelva el backend
// a exactamente "ADMINISTRADOR", "MEDICO" o "PACIENTE"
function normalizarRol(nombre) {
  if (!nombre) return "PACIENTE";
  const n = String(nombre).toUpperCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // quita tildes
  if (n.includes("ADMIN")) return "ADMINISTRADOR";
  if (n.includes("MEDIC") || n.includes("DOCTOR")) return "MEDICO";
  return "PACIENTE";
}
 
// ── ESTADO GLOBAL ──────────────────────────────────────────
const app = document.querySelector("#app");
const state = {
  user:null, rolNombre:null, view:"dashboard", message:"",
  selectedUserId:"", selectedEspecialidadId:"",
  scheduleSpecialty:"", scheduleDoctor:"",
  bookDate:"", bookStart:"",
  citaFilter:"TODOS", usuarioSearch:"", medicoSearch:"",
  db:{ usuarios:[],pacientes:[],medicos:[],especialidades:[],consultorios:[],horarios:[],citas:[],atenciones:[],recetas:[],medicamentos:[],roles:[] }
};
 
// ── API ────────────────────────────────────────────────────
async function apiGet(path){
  const r=await fetch(`${API_BASE}${path}`);
  if(!r.ok) throw new Error(`Error ${r.status} en GET ${path}`);
  return r.json();
}
async function apiPost(path,body){
  const r=await fetch(`${API_BASE}${path}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  if(!r.ok){let m=`Error ${r.status}`;try{const d=await r.json();m=d.message||JSON.stringify(d);}catch(_){}throw new Error(m);}
  return r.json();
}
async function apiPut(path,body){
  const r=await fetch(`${API_BASE}${path}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  if(!r.ok){
    let m=`Error ${r.status}`;
    try{const d=await r.json();m=d.message||JSON.stringify(d);}catch(_){}
    throw new Error(m);
  }
  // Algunos endpoints devuelven 200 con body, otros 204 sin body
  const ct=r.headers.get("content-type")||"";
  if(r.status===204||!ct.includes("application/json")) return {};
  return r.json();
}
async function apiDelete(path){
  const r=await fetch(`${API_BASE}${path}`,{method:"DELETE"});
  if(!r.ok) throw new Error(`Error ${r.status} en DELETE ${path}`);
}

function openPdf(path){
  window.open(`${API_BASE}${path}`, "_blank", "noopener");
}
 
// ── DATOS ──────────────────────────────────────────────────
async function refreshDb(){
  const [usuarios,pacientes,medicos,especialidades,consultorios,horarios,citas,atenciones,recetas,medicamentos,roles]=await Promise.all([
    apiGet("/usuarios"),apiGet("/pacientes"),apiGet("/medicos"),apiGet("/especialidad"),
    apiGet("/consultorios"),apiGet("/horarios"),apiGet("/citas"),apiGet("/atencion"),
    apiGet("/recetas"),apiGet("/medicamentos"),apiGet("/roles")
  ]);
  state.db.usuarios=usuarios; state.db.pacientes=pacientes; state.db.medicos=medicos;
  state.db.especialidades=especialidades; state.db.consultorios=consultorios;
  state.db.horarios=horarios; state.db.citas=citas; state.db.atenciones=atenciones;
  state.db.recetas=recetas; state.db.medicamentos=medicamentos;
  state.db.roles=roles; // cargados directo desde /roles
}
 
async function loginLocal(login,password){
  const usuarios=await apiGet("/usuarios");
  state.db.usuarios=usuarios;
  const found=usuarios.find(u=>(u.username===login||u.email===login)&&u.passwordHash===password);
  if(!found) throw new Error("Usuario o contraseña incorrectos.");
  if(found.estado!=="ACTIVO") throw new Error("Usuario inactivo. Contacta al administrador.");
  return found;
}
 
// ── TOAST ──────────────────────────────────────────────────
function toast(msg,type="ok"){
  let t=document.getElementById("toast-box");
  if(!t){t=document.createElement("div");t.id="toast-box";t.style.cssText="position:fixed;bottom:24px;right:24px;z-index:9999;display:grid;gap:8px;";document.body.appendChild(t);}
  const d=document.createElement("div");
  const colors={ok:"#15803d",error:"#b91c1c",info:"#1d4ed8"};
  d.style.cssText=`background:${colors[type]||colors.ok};color:#fff;padding:12px 18px;border-radius:8px;font-weight:700;font-size:14px;box-shadow:0 4px 18px rgba(0,0,0,.18);max-width:320px;`;
  d.textContent=msg;t.appendChild(d);
  setTimeout(()=>d.remove(),3500);
}
 
// ── INIT ───────────────────────────────────────────────────
async function init(){
  const splash=document.getElementById("splash");
  const saved=localStorage.getItem("posta_user");
  if(saved){
    try{
      state.user=JSON.parse(saved);
      state.rolNombre=normalizarRol(state.user.rol?.nombre);
      await refreshDb();
    }catch(e){ state.user=null; localStorage.removeItem("posta_user"); }
  }
  if(splash) splash.remove();
  render();
}
 
function render(){ if(!state.user){renderAuth();}else{renderShell();} }
 
// ── AUTH ───────────────────────────────────────────────────
function renderAuth(mode="login"){
  const isReg=mode==="register";
  const db=state.db;
  app.innerHTML=`
  <main class="auth-shell">
    <section class="auth-brand">
      <div class="brand-row">
        <div class="brand-mark">+</div>
        <div><div class="brand-title">Posta Médica</div><div class="role-pill">Sistema web clínico</div></div>
      </div>
      <div class="auth-summary">
        <h1>Gestión médica clara para cada rol.</h1>
        <p>Agenda, usuarios, horarios, citas e historial clínico en una sola interfaz.</p>
      </div>
      <div class="auth-metrics">
        <div class="metric-tile"><div class="metric-value">${db.citas.length}</div><div class="metric-label">Citas</div></div>
        <div class="metric-tile"><div class="metric-value">${db.medicos.length}</div><div class="metric-label">Médicos</div></div>
        <div class="metric-tile"><div class="metric-value">${db.pacientes.length}</div><div class="metric-label">Pacientes</div></div>
      </div>
    </section>
    <section class="auth-panel">
      <div class="auth-card">
        <h2>${isReg?"Crear cuenta de paciente":"Iniciar sesión"}</h2>
        <p>${isReg?"Completa tus datos. Tu usuario se genera automáticamente.":"Acceso para pacientes, médicos y administradores."}</p>
        <div id="auth-alert" class="alert ${state.message?"show":""}">${escH(state.message)}</div>
        ${isReg?registerForm():loginForm()}
      </div>
    </section>
  </main>`;
}
 
function loginForm(){return`<form id="login-form" class="form-grid">
  <div class="field"><label>Usuario o correo</label><input name="login" autocomplete="username" required/></div>
  <div class="field"><label>Contraseña</label><input name="password" type="password" autocomplete="current-password" required/></div>
  <div class="button-row">
    <button class="btn" type="submit">Ingresar</button>
    <button class="btn secondary" type="button" data-auth-mode="register">Crear cuenta</button>
  </div>
</form>`;}
 
function registerForm(){return`<form id="register-form" class="form-grid">
  <div class="form-row">
    <div class="field"><label>Nombre</label><input name="nombre" required/></div>
    <div class="field"><label>DNI</label><input name="dni" inputmode="numeric" maxlength="8" required/></div>
  </div>
  <div class="form-row">
    <div class="field"><label>Apellido paterno</label><input name="apellidoP" required/></div>
    <div class="field"><label>Apellido materno</label><input name="apellidoM" required/></div>
  </div>
  <div class="field"><label>Correo</label><input name="email" type="email" required/></div>
  <div class="field"><label>Teléfono</label><input name="telefono" inputmode="tel"/></div>
  <div class="field"><label>Fecha de nacimiento</label><input name="fechaNacimiento" type="date" required/></div>
  <div class="field"><label>Sexo</label><select name="sexo"><option value="M">Masculino</option><option value="F">Femenino</option></select></div>
  <div class="form-row">
    <div class="field"><label>Contraseña</label><input name="password" type="password" minlength="6" required/></div>
    <div class="field"><label>Confirmar</label><input name="confirm" type="password" minlength="6" required/></div>
  </div>
  <div class="button-row">
    <button class="btn" type="submit">Crear cuenta</button>
    <button class="btn secondary" type="button" data-auth-mode="login">Volver</button>
  </div>
</form>`;}
 
// ── SHELL ──────────────────────────────────────────────────
function renderShell(){
  const rol=state.rolNombre; // ya normalizado
  const nav=NAV[rol]||NAV.PACIENTE;
  app.innerHTML=`
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand-row">
        <div class="brand-mark">+</div>
        <div><div class="brand-title">Posta Médica</div><div class="role-pill">${roleLabel(rol)}</div></div>
      </div>
      <nav class="nav">
        ${nav.map(([v,l])=>`<button class="${state.view===v?"active":""}" data-view="${v}">${l}</button>`).join("")}
      </nav>
      <div class="sidebar-footer">
        <div style="font-size:11px;color:#7a9ca5;background:#1a3d48;border-radius:6px;padding:6px 8px;">
          Rol BD: <strong style="color:#c7d8dc">${escH(state.user.rol?.nombre||"sin rol")}</strong>
        </div>
        <span>${escH(state.user.email||state.user.username)}</span>
        <button class="btn ghost" type="button" data-action="logout">Cerrar sesión</button>
      </div>
    </aside>
    <section class="main">
      <header class="topbar">
        <div>
          <div class="topbar-title">${viewTitle(state.view)}</div>
          <div style="color:var(--muted);font-size:13px">${new Date().toLocaleDateString("es-PE",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
        </div>
        <div class="user-chip">
          <span class="avatar">${(state.user.username||"U")[0].toUpperCase()}</span>
          <span>${escH(state.user.username||"")}</span>
        </div>
      </header>
      <main class="content" id="view-content">
        <div style="display:flex;align-items:center;gap:10px;color:var(--muted)">
          <div class="spinner"></div> Cargando...
        </div>
      </main>
    </section>
  </div>`;
  renderView();
}
 
async function renderView(){
  const el=document.getElementById("view-content");
  if(!el) return;
  try{ el.innerHTML=await buildView(); }
  catch(e){ el.innerHTML=`<div class="alert show">❌ Error al cargar: ${escH(e.message)}</div>`; }
}
 
async function buildView(){
  const rol=state.rolNombre;
  // Debug: si el rol no es reconocido, lo mostramos claramente
  if(!["ADMINISTRADOR","MEDICO","PACIENTE"].includes(rol)){
    return`<div class="alert show" style="display:block">
      ⚠️ Rol no reconocido: <strong>"${escH(state.user?.rol?.nombre||"(vacío)")}"</strong><br>
      El sistema espera: ADMINISTRADOR, MEDICO o PACIENTE.<br>
      Verifica que la tabla <code>rol</code> en tu base de datos tenga esos valores exactos.
    </div>`;
  }
  if(rol==="ADMINISTRADOR") return buildAdminView();
  if(rol==="MEDICO") return buildDoctorView();
  return buildPatientView();
}
 
// ══════════════════════════════════════════════════════════
//  VISTAS ADMINISTRADOR
// ══════════════════════════════════════════════════════════
async function buildAdminView(){
  if(state.view==="usuarios")      return adminUsersView();
  if(state.view==="medicos")       return adminMedicosView();
  if(state.view==="especialidades")return adminEspecialidadesView();
  if(state.view==="horarios")      return adminSchedulesView();
  if(state.view==="citas")         return adminCitasView();
  if(state.view==="reportes")      return adminReportesView();
  return adminDashboardView();
}
 
// ── Dashboard ──────────────────────────────────────────────
function adminDashboardView(){
  const db=state.db;
  const activos=db.usuarios.filter(u=>u.estado==="ACTIVO").length;
  const pendientes=db.citas.filter(c=>c.estado==="PENDIENTE").length;
  const confirmadas=db.citas.filter(c=>c.estado==="CONFIRMADA").length;
  const atendidas=db.citas.filter(c=>c.estado==="ATENDIDA").length;
  const canceladas=db.citas.filter(c=>c.estado==="CANCELADA").length;
  const totalCitas=db.citas.length||1;
 
  // Últimas 6 citas
  const ultimas=[...db.citas].reverse().slice(0,6);
 
  return`
  ${viewHeader("Panel administrativo","Resumen operativo del sistema.")}
  <section class="stats-grid">
    ${statCard(db.usuarios.length,"👥 Usuarios")}
    ${statCard(activos,"✅ Activos")}
    ${statCard(db.medicos.length,"🩺 Médicos")}
    ${statCard(db.pacientes.length,"🏥 Pacientes")}
    ${statCard(pendientes,"⏳ Pendientes")}
    ${statCard(confirmadas,"📌 Confirmadas")}
    ${statCard(atendidas,"✔️ Atendidas")}
    ${statCard(canceladas,"❌ Canceladas")}
  </section>
 
  <div class="split">
    <section class="panel">
      <div class="panel-header"><h3>Estado de citas</h3></div>
      <div class="panel-body">
        ${barChart([
          {label:"Pendientes",value:pendientes,total:totalCitas,color:"#b45309"},
          {label:"Confirmadas",value:confirmadas,total:totalCitas,color:"#1d4ed8"},
          {label:"Atendidas",value:atendidas,total:totalCitas,color:"#15803d"},
          {label:"Canceladas",value:canceladas,total:totalCitas,color:"#b91c1c"}
        ])}
      </div>
    </section>
    <section class="panel">
      <div class="panel-header"><h3>Últimas citas</h3><button class="btn small secondary" data-view="citas">Ver todas</button></div>
      <div class="panel-body">${citasTableCompact(ultimas)}</div>
    </section>
  </div>
 
  <div class="split">
    <section class="panel">
      <div class="panel-header"><h3>Médicos por especialidad</h3></div>
      <div class="panel-body">
        <div class="timeline">
          ${db.especialidades.map(e=>{
            const cnt=db.medicos.filter(m=>m.especialidad?.idEspecialidad===e.idEspecialidad).length;
            return`<div class="timeline-item"><strong>${escH(e.nombre)}</strong><span>${cnt} médico(s) registrado(s)</span></div>`;
          }).join("")||`<div class="empty">Sin especialidades registradas.</div>`}
        </div>
      </div>
    </section>
    <section class="panel">
      <div class="panel-header"><h3>Acciones rápidas</h3></div>
      <div class="panel-body" style="display:grid;gap:10px">
        <button class="btn" data-view="usuarios">➕ Nuevo usuario</button>
        <button class="btn secondary" data-view="medicos">🩺 Registrar médico</button>
        <button class="btn secondary" data-view="especialidades">🏥 Gestionar especialidades</button>
        <button class="btn secondary" data-view="horarios">🕐 Gestionar horarios</button>
        <button class="btn ghost" data-view="reportes">📈 Ver reportes</button>
      </div>
    </section>
  </div>`;
}
 
// ── Usuarios ───────────────────────────────────────────────
function adminUsersView(){
  const db=state.db;
  const sel=db.usuarios.find(u=>u.idUsuario===state.selectedUserId);
  const busqueda=state.usuarioSearch.toLowerCase();
  // Fallback: si /roles no cargó, extraer roles únicos de los usuarios
  if(!db.roles||db.roles.length===0){
    const rm={};
    db.usuarios.forEach(u=>{if(u.rol&&u.rol.idRol) rm[u.rol.idRol]=u.rol;});
    db.roles=Object.values(rm);
  }
  const filtrados=db.usuarios.filter(u=>
    !busqueda||u.username.toLowerCase().includes(busqueda)||u.email.toLowerCase().includes(busqueda)||(u.rol?.nombre||"").toLowerCase().includes(busqueda)
  );
  return`
  ${viewHeader("Gestión de usuarios","Alta, edición y cambio de estado por rol.")}
  <div class="split">
    <section class="panel">
      <div class="panel-header"><h3>${sel?"✏️ Editar usuario":"➕ Nuevo usuario"}</h3></div>
      <div class="panel-body">
        <form id="user-form" class="form-grid">
          <input type="hidden" name="idItem" value="${sel?sel.idUsuario:""}"/>
          <div class="field"><label>Nombre de usuario</label><input name="username" value="${sel?escA(sel.username):""}" required placeholder="ej: jlopez"/></div>
          <div class="field"><label>Correo electrónico</label><input name="email" type="email" value="${sel?escA(sel.email):""}" required placeholder="correo@ejemplo.com"/></div>
          <div class="form-row">
            <div class="field">
              <label>Rol</label>
              <select name="idRol">
                ${db.roles.map(r=>`<option value="${r.idRol}" ${String(sel?.rol?.idRol)===String(r.idRol)?"selected":""}>${escH(r.nombre)}</option>`).join("")}
              </select>
            </div>
            <div class="field">
              <label>Estado</label>
              <select name="estado">
                <option value="ACTIVO" ${sel?.estado==="ACTIVO"?"selected":""}>ACTIVO</option>
                <option value="INACTIVO" ${sel?.estado==="INACTIVO"?"selected":""}>INACTIVO</option>
              </select>
            </div>
          </div>
          ${!sel?`<div class="field"><label>Contraseña</label><input name="password" type="password" minlength="6" required placeholder="Mínimo 6 caracteres"/></div>`:""}
          <div class="button-row">
            <button class="btn" type="submit">${sel?"💾 Actualizar":"➕ Crear usuario"}</button>
            ${sel?`<button class="btn secondary" type="button" data-action="new-user">Nuevo</button>`:""}
          </div>
        </form>
      </div>
    </section>
    <section class="panel">
      <div class="panel-header">
        <h3>Usuarios registrados <span style="color:var(--muted);font-weight:400;font-size:13px">(${filtrados.length})</span></h3>
        <input class="searchbar-input" placeholder="🔍 Buscar..." value="${escA(state.usuarioSearch)}" data-search="usuario" style="min-height:34px;border:1px solid #cfd9df;border-radius:8px;padding:6px 10px;font:inherit;"/>
      </div>
      <div class="panel-body">${usuariosTable(filtrados)}</div>
    </section>
  </div>`;
}
 
// ── Médicos ────────────────────────────────────────────────
function adminMedicosView(){
  const db=state.db;
  const sel=db.medicos.find(m=>m.idMedico===state.selectedUserId);
  const busqueda=state.medicoSearch.toLowerCase();
  const filtrados=db.medicos.filter(m=>
    !busqueda||(m.nombre+" "+m.apellido).toLowerCase().includes(busqueda)||(m.especialidad?.nombre||"").toLowerCase().includes(busqueda)
  );
  return`
  ${viewHeader("Gestión de médicos","Registro y edición de médicos con especialidad.")}
  <div class="split">
    <section class="panel">
      <div class="panel-header"><h3>${sel?"✏️ Editar médico":"➕ Nuevo médico"}</h3></div>
      <div class="panel-body">
        <form id="medico-form" class="form-grid">
          <input type="hidden" name="idItem" value="${sel?sel.idMedico:""}"/>
          <div class="form-row">
            <div class="field"><label>Nombre</label><input name="nombre" value="${sel?escA(sel.nombre):""}" required/></div>
            <div class="field"><label>Apellido</label><input name="apellido" value="${sel?escA(sel.apellido):""}" required/></div>
          </div>
          <div class="form-row">
            <div class="field"><label>Teléfono</label><input name="telefono" value="${sel?escA(sel.telefono||""):""}"/></div>
            <div class="field"><label>Sexo</label>
              <select name="sexo">
                <option value="M" ${sel?.sexo==="M"?"selected":""}>Masculino</option>
                <option value="F" ${sel?.sexo==="F"?"selected":""}>Femenino</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label>Especialidad</label>
            <select name="idEspecialidad">
              <option value="">— Seleccione —</option>
              ${db.especialidades.map(e=>`<option value="${e.idEspecialidad}" ${sel?.especialidad?.idEspecialidad===e.idEspecialidad?"selected":""}>${escH(e.nombre)}</option>`).join("")}
            </select>
          </div>
          <div class="field"><label>Fecha de nacimiento</label><input name="fechaNacimiento" type="date" value="${sel?(sel.fechaNacimiento||""):""}"/></div>
          ${!sel?`
          <div class="field">
            <label>Usuario vinculado <span style="color:var(--muted);font-weight:400;font-size:11px">(solo usuarios sin médico asignado)</span></label>
            <div style="position:relative">
              <input
                type="text"
                id="usuario-search-input"
                placeholder="🔍 Escribe nombre o usuario..."
                autocomplete="off"
                style="width:100%;border:1px solid #cfd9df;border-radius:8px;padding:9px 11px;font:inherit;outline:none"
                oninput="filtrarUsuariosDisponibles(this.value)"
                onfocus="document.getElementById('usuario-dropdown').style.display='block'"
              />
              <input type="hidden" name="idUsuario" id="idUsuario-hidden"/>
              <div id="usuario-dropdown" style="
                display:none;position:absolute;top:100%;left:0;right:0;z-index:999;
                background:#fff;border:1px solid #cfd9df;border-radius:0 0 8px 8px;
                max-height:200px;overflow-y:auto;box-shadow:0 4px 12px rgba(0,0,0,.1)">
                ${(()=>{
                  // Usuarios que ya tienen médico asignado
                  const idsMedicos=new Set(db.medicos.map(m=>m.usuario?.idUsuario).filter(Boolean));
                  // Mostrar solo usuarios ACTIVOS sin médico
                  const disponibles=db.usuarios.filter(u=>
                    u.estado==="ACTIVO" && !idsMedicos.has(u.idUsuario)
                  );
                  if(!disponibles.length) return`<div style="padding:10px;color:var(--muted);font-size:13px">No hay usuarios disponibles sin médico asignado.</div>`;
                  return disponibles.map(u=>{
                    // Verificar si tiene paciente vinculado para mostrar indicador
                    const tienePaciente=state.db.pacientes.some(p=>
                      (p.usuario?.idUsuario||p.usuarioId||p.id_usuario)===u.idUsuario
                    );
                    return`
                    <div class="usuario-option"
                      data-id="${escA(u.idUsuario)}"
                      data-label="${escA(u.username+' ('+u.idUsuario+')')}"
                      onclick="seleccionarUsuario(this)"
                      style="padding:10px 12px;cursor:pointer;border-bottom:1px solid #f0f0f0;font-size:13px"
                      onmouseover="this.style.background='#f0faf8'"
                      onmouseout="this.style.background=''"
                    >
                      <div style="display:flex;justify-content:space-between;align-items:center">
                        <div>
                          <strong>${escH(u.username)}</strong>
                          <span style="color:var(--muted);margin-left:6px;font-size:11px">${escH(u.idUsuario)}</span>
                          <span style="color:var(--muted);margin-left:6px;font-size:11px">${escH(u.email)}</span>
                        </div>
                        <div style="display:flex;gap:6px;align-items:center">
                          <span style="font-size:11px;color:var(--muted)">${escH(u.rol?.nombre||"")}</span>
                          ${tienePaciente
                            ?`<span style="background:#dcfce7;color:#166534;font-size:10px;padding:2px 6px;border-radius:999px;font-weight:700">datos disponibles</span>`
                            :``}
                        </div>
                      </div>
                    </div>`;
                  }).join("");
                })()}
              </div>
            </div>
            <div id="usuario-seleccionado" style="display:none;margin-top:6px;background:#f0faf8;border:1px solid #b2d8d2;border-radius:6px;padding:8px 12px;font-size:13px">
              ✅ Seleccionado: <strong id="usuario-sel-label"></strong>
              <button type="button" onclick="limpiarUsuario()" style="float:right;background:none;border:none;color:var(--danger);cursor:pointer;font-size:13px">✕ Cambiar</button>
            </div>
          </div>
          `:""}
          <div class="button-row">
            <button class="btn" type="submit">${sel?"💾 Actualizar":"➕ Crear médico"}</button>
            ${sel?`<button class="btn secondary" type="button" data-action="new-medico">Nuevo</button>`:""}
          </div>
        </form>
      </div>
    </section>
    <section class="panel">
      <div class="panel-header">
        <h3>Médicos registrados <span style="color:var(--muted);font-weight:400;font-size:13px">(${filtrados.length})</span></h3>
        <input class="searchbar-input" placeholder="🔍 Buscar..." value="${escA(state.medicoSearch)}" data-search="medico" style="min-height:34px;border:1px solid #cfd9df;border-radius:8px;padding:6px 10px;font:inherit;"/>
      </div>
      <div class="panel-body">${medicosTable(filtrados)}</div>
    </section>
  </div>`;
}
 
// ── Especialidades ─────────────────────────────────────────
function adminEspecialidadesView(){
  const db=state.db;
  const sel=db.especialidades.find(e=>e.idEspecialidad==state.selectedEspecialidadId);
  return`
  ${viewHeader("Especialidades","Gestión de especialidades médicas.")}
  <div class="split">
    <section class="panel">
      <div class="panel-header"><h3>${sel?"✏️ Editar especialidad":"➕ Nueva especialidad"}</h3></div>
      <div class="panel-body">
        <form id="especialidad-form" class="form-grid">
          <input type="hidden" name="idItem" value="${sel?sel.idEspecialidad:""}"/>
          <div class="field"><label>Nombre</label><input name="nombre" value="${sel?escA(sel.nombre):""}" required placeholder="Ej: Cardiología"/></div>
          <div class="field"><label>Descripción</label><textarea name="descripcion" rows="3" placeholder="Descripción opcional">${sel?escH(sel.descripcion||""):""}</textarea></div>
          <div class="button-row">
            <button class="btn" type="submit">${sel?"💾 Actualizar":"➕ Crear"}</button>
            ${sel?`<button class="btn secondary" type="button" data-action="new-especialidad">Nueva</button>`:""}
          </div>
        </form>
      </div>
    </section>
    <section class="panel">
      <div class="panel-header"><h3>Especialidades registradas <span style="color:var(--muted);font-weight:400;font-size:13px">(${db.especialidades.length})</span></h3></div>
      <div class="panel-body">${especialidadesTable(db.especialidades)}</div>
    </section>
  </div>`;
}
 
// ── Horarios ───────────────────────────────────────────────
function adminSchedulesView(){
  const db=state.db;
  const specId=state.scheduleSpecialty||db.especialidades[0]?.idEspecialidad||"";
  if(!state.scheduleSpecialty) state.scheduleSpecialty=specId;
  const doctors=db.medicos.filter(m=>m.especialidad?.idEspecialidad==specId);
  const docId=state.scheduleDoctor||doctors[0]?.idMedico||"";
  if(!state.scheduleDoctor) state.scheduleDoctor=docId;
  const horariosMedico=db.horarios.filter(h=>h.medico?.idMedico===state.scheduleDoctor);
  const sMap={};
  horariosMedico.forEach(h=>{sMap[h.diaSemana]=[h.horaInicio,h.horaFin,h.idHorario,h.estado];});
 
  return`
  ${viewHeader("Gestión de horarios","Programación semanal por especialidad y médico.")}
  <div class="split">
    <section class="panel">
      <div class="panel-header"><h3>🕐 Asignar horario</h3></div>
      <div class="panel-body">
        <form id="schedule-form" class="form-grid">
          <div class="form-row">
            <div class="field">
              <label>Especialidad</label>
              <select id="schedule-specialty" name="specialtyId">
                ${db.especialidades.map(s=>`<option value="${s.idEspecialidad}" ${s.idEspecialidad==state.scheduleSpecialty?"selected":""}>${escH(s.nombre)}</option>`).join("")}
              </select>
            </div>
            <div class="field">
              <label>Médico</label>
              <select id="schedule-doctor" name="doctorId">
                ${doctors.length
                  ?doctors.map(d=>`<option value="${d.idMedico}" ${d.idMedico===state.scheduleDoctor?"selected":""}>${escH(d.nombre+" "+d.apellido)}</option>`).join("")
                  :`<option value="">— Sin médicos en esta especialidad —</option>`}
              </select>
            </div>
          </div>
          <div style="background:#f8fafc;border:1px solid var(--line);border-radius:8px;padding:14px">
            <div style="font-size:12px;font-weight:700;color:#455767;text-transform:uppercase;margin-bottom:12px;">Horario semanal</div>
            <div style="display:grid;grid-template-columns:100px 1fr 1fr;gap:8px;margin-bottom:8px;">
              <div style="font-size:11px;font-weight:700;color:var(--muted)">DÍA</div>
              <div style="font-size:11px;font-weight:700;color:var(--muted)">HORA INICIO</div>
              <div style="font-size:11px;font-weight:700;color:var(--muted)">HORA FIN</div>
            </div>
            <div class="schedule-grid">
              ${DAYS.map(day=>scheduleRow(day,sMap[DAY_MAP[day]])).join("")}
            </div>
          </div>
          <div class="button-row">
            <button class="btn" type="submit" ${!docId?"disabled":""}>💾 Guardar horario</button>
            <span style="color:var(--muted);font-size:13px">Solo se guardan los días con horas definidas</span>
          </div>
        </form>
      </div>
    </section>
    <section class="panel">
      <div class="panel-header"><h3>Horarios actuales</h3></div>
      <div class="panel-body">
        ${docId
          ?`<div style="margin-bottom:10px;color:var(--muted);font-size:13px">Médico: <strong style="color:var(--text)">${escH(doctors.find(d=>d.idMedico===docId)?.nombre||"")} ${escH(doctors.find(d=>d.idMedico===docId)?.apellido||"")}</strong></div>${horariosTable(horariosMedico)}`
          :`<div class="empty">Selecciona un médico para ver sus horarios.</div>`}
      </div>
    </section>
  </div>`;
}
 
// ── Citas ──────────────────────────────────────────────────
function adminCitasView(){
  const db=state.db;
  const filtros=["TODOS","PENDIENTE","CONFIRMADA","ATENDIDA","CANCELADA"];
  const filtradas=state.citaFilter==="TODOS"?db.citas:db.citas.filter(c=>c.estado===state.citaFilter);
  return`
  ${viewHeader("Gestión de citas","Seguimiento completo de reservas y estados.")}
  <section class="panel">
    <div class="panel-header">
      <h3>Citas registradas <span style="color:var(--muted);font-weight:400;font-size:13px">(${filtradas.length})</span></h3>
      <div class="button-row">
        ${filtros.map(f=>`<button class="btn small ${state.citaFilter===f?"":"ghost"}" data-filter-cita="${f}">${f==="TODOS"?"Todas":f}</button>`).join("")}
      </div>
    </div>
    <div class="panel-body">${citasTableAdmin(filtradas)}</div>
  </section>`;
}
 
// ── Reportes ───────────────────────────────────────────────
function adminReportesView(){
  const db=state.db;
  const atendidas=db.citas.filter(c=>c.estado==="ATENDIDA").length;
  const canceladas=db.citas.filter(c=>c.estado==="CANCELADA").length;
  const pendientes=db.citas.filter(c=>c.estado==="PENDIENTE").length;
  const confirmadas=db.citas.filter(c=>c.estado==="CONFIRMADA").length;
  const totalCitas=db.citas.length||1;
 
  // Citas por especialidad
  const porEsp=db.especialidades.map(e=>{
    const ids=db.medicos.filter(m=>m.especialidad?.idEspecialidad===e.idEspecialidad).map(m=>m.idMedico);
    const total=db.citas.filter(c=>ids.includes(c.medico?.idMedico)).length;
    return{label:e.nombre,value:total,total:totalCitas,color:"#0f766e"};
  });
 
  // Top médicos
  const topMedicos=[...db.medicos].map(m=>{
    const cnt=db.citas.filter(c=>c.medico?.idMedico===m.idMedico&&c.estado==="ATENDIDA").length;
    return{nombre:`${m.nombre} ${m.apellido}`,esp:m.especialidad?.nombre||"—",cnt};
  }).sort((a,b)=>b.cnt-a.cnt).slice(0,5);
 
  return`
  ${viewHeader("Reportes","Indicadores generales del sistema.")}
  <section class="stats-grid">
    ${statCard(db.citas.length,"📋 Total citas")}
    ${statCard(atendidas,"✔️ Atendidas")}
    ${statCard(pendientes,"⏳ Pendientes")}
    ${statCard(canceladas,"❌ Canceladas")}
    ${statCard(db.usuarios.filter(u=>u.estado==="ACTIVO").length,"✅ Usuarios activos")}
    ${statCard(db.medicos.length,"🩺 Médicos")}
    ${statCard(db.pacientes.length,"🏥 Pacientes")}
    ${statCard(db.atenciones.length,"📁 Atenciones")}
  </section>
 
  <div class="split">
    <section class="panel">
      <div class="panel-header"><h3>Citas por estado</h3></div>
      <div class="panel-body">
        ${barChart([
          {label:"Pendientes",value:pendientes,total:totalCitas,color:"#b45309"},
          {label:"Confirmadas",value:confirmadas,total:totalCitas,color:"#1d4ed8"},
          {label:"Atendidas",value:atendidas,total:totalCitas,color:"#15803d"},
          {label:"Canceladas",value:canceladas,total:totalCitas,color:"#b91c1c"}
        ])}
      </div>
    </section>
    <section class="panel">
      <div class="panel-header"><h3>Citas por especialidad</h3></div>
      <div class="panel-body">
        ${porEsp.length?barChart(porEsp):`<div class="empty">Sin datos</div>`}
      </div>
    </section>
  </div>
 
  <section class="panel">
    <div class="panel-header"><h3>🏆 Top médicos por atenciones</h3></div>
    <div class="panel-body">
      ${topMedicos.length?`
      <div class="table-wrap"><table>
        <thead><tr><th>#</th><th>Médico</th><th>Especialidad</th><th>Atenciones</th></tr></thead>
        <tbody>
          ${topMedicos.map((m,i)=>`<tr>
            <td><strong>${i+1}</strong></td>
            <td>${escH(m.nombre)}</td>
            <td>${escH(m.esp)}</td>
            <td><strong>${m.cnt}</strong></td>
          </tr>`).join("")}
        </tbody>
      </table></div>`:`<div class="empty">Sin atenciones registradas.</div>`}
    </div>
  </section>`;
}
 
// ══════════════════════════════════════════════════════════
//  VISTAS MÉDICO
// ══════════════════════════════════════════════════════════
async function buildDoctorView(){
  if(state.view==="agenda")   return doctorAgendaView();
  if(state.view==="historial")return doctorHistorialView();
  if(state.view==="horarios") return doctorHorariosView();
  if(state.view==="reportes") return doctorReportesView();
  return doctorDashboardView();
}
function currentDoctor(){ return state.db.medicos.find(m=>m.usuario?.idUsuario===state.user.idUsuario); }
 
function doctorDashboardView(){
  const doctor=currentDoctor();
  const citas=doctor?state.db.citas.filter(c=>c.medico?.idMedico===doctor.idMedico):[];
  return`
  ${viewHeader("Panel médico","Agenda clínica y seguimiento de pacientes.")}
  <section class="stats-grid">
    ${statCard(citas.length,"Citas asignadas")}
    ${statCard(citas.filter(c=>c.estado==="CONFIRMADA").length,"Confirmadas")}
    ${statCard(citas.filter(c=>c.estado==="ATENDIDA").length,"Atendidas")}
    ${statCard(state.db.atenciones.filter(a=>a.cita?.medico?.idMedico===doctor?.idMedico).length,"Atenciones")}
  </section>
  <section class="panel">
    <div class="panel-header"><h3>Agenda próxima</h3><button class="btn small secondary" data-view="agenda">Abrir agenda</button></div>
    <div class="panel-body">${citasTableDoctor(citas.slice(0,6))}</div>
  </section>`;
}
function doctorAgendaView(){
  const doctor=currentDoctor();
  const citas=doctor?state.db.citas.filter(c=>c.medico?.idMedico===doctor.idMedico):[];
  return`
  ${viewHeader("Agenda","Pacientes citados.")}
  <section class="panel">
    <div class="panel-header"><h3>Citas asignadas</h3></div>
    <div class="panel-body">${citasTableDoctor(citas)}</div>
  </section>`;
}
function doctorHistorialView(){
  const doctor=currentDoctor();
  const rows=state.db.atenciones.filter(a=>a.cita?.medico?.idMedico===doctor?.idMedico);
  return`
  ${viewHeader("Historial de pacientes","Atenciones y diagnósticos registrados.")}
  <section class="panel">
    <div class="panel-header"><h3>Historial clínico</h3></div>
    <div class="panel-body">${atencionesTable(rows)}</div>
  </section>`;
}
function doctorHorariosView(){
  const doctor=currentDoctor();
  const horarios=doctor?state.db.horarios.filter(h=>h.medico?.idMedico===doctor.idMedico):[];
  return`
  ${viewHeader("Mis horarios","Disponibilidad semanal registrada.")}
  <section class="panel">
    <div class="panel-header"><h3>${escH(doctor?doctor.nombre+" "+doctor.apellido:"Médico")}</h3></div>
    <div class="panel-body">${horariosTable(horarios)}</div>
  </section>`;
}
function doctorReportesView(){
  const doctor=currentDoctor();
  const citas=doctor?state.db.citas.filter(c=>c.medico?.idMedico===doctor.idMedico):[];
  return`
  ${viewHeader("Mis reportes","Productividad y estados de atención.")}
  <section class="stats-grid">
    ${statCard(citas.filter(c=>c.estado==="PENDIENTE").length,"Pendientes")}
    ${statCard(citas.filter(c=>c.estado==="CONFIRMADA").length,"Confirmadas")}
    ${statCard(citas.filter(c=>c.estado==="ATENDIDA").length,"Atendidas")}
    ${statCard(citas.filter(c=>c.estado==="CANCELADA").length,"Canceladas")}
  </section>`;
}
 
// ══════════════════════════════════════════════════════════
//  VISTAS PACIENTE
// ══════════════════════════════════════════════════════════
async function buildPatientView(){
  if(state.view==="registrar-cita") return patientBookView();
  if(state.view==="mis-citas")      return patientMisCitasView();
  if(state.view==="historial")      return patientHistorialView();
  if(state.view==="cancelar")       return patientCancelarView();
  return patientDashboardView();
}
function currentPatient(){ return state.db.pacientes.find(p=>p.usuario?.idUsuario===state.user.idUsuario); }
 
function patientDashboardView(){
  const patient=currentPatient();
  const citas=patient?state.db.citas.filter(c=>c.paciente?.idPaciente===patient.idPaciente):[];
  return`
  ${viewHeader("Panel paciente","Citas, historial y reservas.")}
  <section class="stats-grid">
    ${statCard(citas.length,"Mis citas")}
    ${statCard(citas.filter(c=>c.estado==="PENDIENTE").length,"Pendientes")}
    ${statCard(citas.filter(c=>c.estado==="CONFIRMADA").length,"Confirmadas")}
    ${statCard(citas.filter(c=>c.estado==="ATENDIDA").length,"Atendidas")}
  </section>
  <section class="panel">
    <div class="panel-header"><h3>Próximas citas</h3><button class="btn small secondary" data-view="registrar-cita">Nueva cita</button></div>
    <div class="panel-body">${citasTablePaciente(citas,false)}</div>
  </section>`;
}
function patientBookView(){
  const db=state.db;
  const specId=state.scheduleSpecialty||db.especialidades[0]?.idEspecialidad||"";
  if(!state.scheduleSpecialty) state.scheduleSpecialty=specId;
  const doctors=db.medicos.filter(m=>m.especialidad?.idEspecialidad==specId);
  const docId=state.scheduleDoctor||doctors[0]?.idMedico||"";
  if(!state.scheduleDoctor) state.scheduleDoctor=docId;
  const schedule=activeScheduleForDate(docId,state.bookDate);
  const startOptions=scheduleHourOptions(schedule,"start",state.bookStart);
  const firstStart=startOptions ? (state.bookStart&&startOptions.includes(`value="${state.bookStart}"`)?state.bookStart:(startOptions.match(/value="([^"]+)"/)?.[1]||"")) : "";
  if(firstStart && state.bookStart!==firstStart) state.bookStart=firstStart;
  const endOptions=scheduleHourOptions(schedule,"end",firstStart);
  const scheduleMessage=!state.bookDate
    ?"Selecciona una fecha para ver los horarios disponibles."
    :schedule
      ?`Horario disponible: ${normalizeTime(schedule.horaInicio)} - ${normalizeTime(schedule.horaFin)}`
      :"El médico no tiene horario activo para esa fecha.";
  const consultorios=db.consultorios.filter(c=>c.estado==="DISPONIBLE");

  // Horas ocupadas cargadas asincrónicamente
  const ocupadas=state.horasOcupadas||[];

  return`
  ${viewHeader("Registrar cita","Reserva por especialidad, médico y horario.")}
  <section class="panel">
    <div class="panel-header"><h3>Nueva cita</h3></div>
    <div class="panel-body">
      <form id="book-form" class="form-grid">
        <div class="form-row">
          <div class="field"><label>Especialidad</label>
            <select name="specialtyId" id="book-specialty">
              ${db.especialidades.map(s=>`<option value="${s.idEspecialidad}" ${s.idEspecialidad==specId?"selected":""}>${escH(s.nombre)}</option>`).join("")}
            </select>
          </div>
          <div class="field"><label>Médico</label>
            <select name="doctorId" id="book-doctor">
              ${doctors.length
                ?doctors.map(d=>`<option value="${d.idMedico}" ${d.idMedico===docId?"selected":""}>${escH(d.nombre+" "+d.apellido)}</option>`).join("")
                :`<option value="">No hay médicos para esta especialidad</option>`}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="field"><label>Consultorio</label>
            <select name="consultorioId">
              ${consultorios.map(c=>`<option value="${c.idConsultorio}">${escH(c.nombre)}</option>`).join("")}
            </select>
          </div>
          <div class="field"><label>Fecha</label>
            <input name="date" id="book-date" type="date"
              value="${escA(state.bookDate)}"
              min="${new Date().toISOString().split('T')[0]}"
              required/>
          </div>
        </div>

        <!-- Horas ocupadas -->
        ${state.bookDate&&docId?`
        <div style="background:#fff8f0;border:1px solid #f59e0b;border-radius:8px;padding:12px 14px">
          <div style="font-size:12px;font-weight:700;color:#92400e;margin-bottom:8px">⏰ Horas ya ocupadas en esta fecha</div>
          ${ocupadas.length
            ?`<div style="display:flex;flex-wrap:wrap;gap:6px">
                ${ocupadas.map(o=>`
                  <span style="background:#fee2e2;color:#991b1b;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:700">
                    🚫 ${escH(o.horaInicio.substring(0,5))} - ${escH(o.horaFin.substring(0,5))}
                  </span>`).join("")}
              </div>`
            :`<div style="color:#15803d;font-size:13px;font-weight:700">✅ No hay citas reservadas — todos los horarios disponibles</div>`}
        </div>`:""}

        <div class="form-row">
          <div class="field"><label>Hora inicio</label><select name="start" id="book-start" ${!schedule?"disabled":""}>${startOptions||`<option value="">Sin horario</option>`}</select></div>
          <div class="field"><label>Hora fin</label><select name="end" ${!schedule||!firstStart?"disabled":""}>${endOptions||`<option value="">Sin horario</option>`}</select></div>
        </div>
        <div style="color:${schedule?"var(--muted)":"var(--danger)"};font-size:13px;font-weight:700">${escH(scheduleMessage)}</div>
        <div class="field"><label>Motivo de consulta</label><textarea name="reason" rows="3" required placeholder="Describe brevemente el motivo de tu visita"></textarea></div>
        <button class="btn" type="submit">📋 Registrar cita</button>
      </form>
    </div>
  </section>`;
}
function patientMisCitasView(){
  const patient=currentPatient();
  const citas=patient?state.db.citas.filter(c=>c.paciente?.idPaciente===patient.idPaciente):[];
  return`
  ${viewHeader("Mis citas","Reservas y estados de atención.")}
  <section class="panel">
    <div class="panel-header"><h3>Citas</h3></div>
    <div class="panel-body">${citasTablePaciente(citas,false)}</div>
  </section>`;
}
function patientHistorialView(){
  const patient=currentPatient();
  if(!patient) return`<div class="empty">No se encontró tu perfil de paciente.</div>`;

  // Filtrar atenciones del paciente
  const atenciones=state.db.atenciones.filter(a=>
    a.cita?.paciente?.idPaciente===patient.idPaciente
  );

  // Todas las citas del paciente
  const citas=state.db.citas.filter(c=>c.paciente?.idPaciente===patient.idPaciente);
  const citasAtendidas=citas.filter(c=>c.estado==="ATENDIDA");
  const citasPendientes=citas.filter(c=>["PENDIENTE","CONFIRMADA"].includes(c.estado));

  // Recetas del paciente (buscar por atención)
  const idAtenciones=new Set(atenciones.map(a=>a.idAtencion));
  const recetas=state.db.recetas.filter(r=>idAtenciones.has(r.atencion?.idAtencion));

  return`
  ${viewHeader("Mi historial clínico","Resumen completo de tus atenciones, diagnósticos y recetas.")}

  <!-- Estadísticas personales -->
  <section class="stats-grid" style="grid-template-columns:repeat(4,minmax(0,1fr));margin-bottom:16px">
    ${statCard(citas.length,"📋 Total citas")}
    ${statCard(citasAtendidas.length,"✅ Atendidas")}
    ${statCard(citasPendientes.length,"⏳ Pendientes")}
    ${statCard(recetas.length,"💊 Recetas")}
  </section>

  <!-- Datos del paciente -->
  <section class="panel" style="margin-bottom:16px">
    <div class="panel-header"><h3>👤 Mis datos</h3></div>
    <div class="panel-body">
      <div class="form-row">
        <div>
          <div style="font-size:12px;color:var(--muted);font-weight:700;margin-bottom:2px">NOMBRE COMPLETO</div>
          <div style="font-weight:700">${escH(patient.nombre||"")} ${escH(patient.apellido||"")}</div>
        </div>
        <div>
          <div style="font-size:12px;color:var(--muted);font-weight:700;margin-bottom:2px">DNI</div>
          <div>${escH(patient.dni||"—")}</div>
        </div>
        <div>
          <div style="font-size:12px;color:var(--muted);font-weight:700;margin-bottom:2px">FECHA DE NACIMIENTO</div>
          <div>${escH(patient.fechaNacimiento?patient.fechaNacimiento.split("T")[0]:"—")}</div>
        </div>
        <div>
          <div style="font-size:12px;color:var(--muted);font-weight:700;margin-bottom:2px">TELÉFONO</div>
          <div>${escH(patient.telefono||"—")}</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Historial de atenciones -->
  <section class="panel" style="margin-bottom:16px">
    <div class="panel-header">
      <h3>🩺 Atenciones médicas</h3>
      <span style="color:var(--muted);font-size:13px">${atenciones.length} registro(s)</span>
    </div>
    <div class="panel-body">
      ${atenciones.length?`
      <div style="display:grid;gap:12px">
        ${atenciones.map(a=>{
          const receta=recetas.find(r=>r.atencion?.idAtencion===a.idAtencion);
          return`
          <div style="border:1px solid var(--line);border-radius:8px;overflow:hidden">
            <div style="background:#f8fafc;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--line)">
              <div style="font-weight:700;color:var(--primary)">
                📅 ${escH(a.fechaAtencion?a.fechaAtencion.split("T")[0]:"—")}
                <span style="color:var(--muted);font-weight:400;margin-left:8px;font-size:13px">
                  ${escH(a.cita?.medico?"Dr(a). "+a.cita.medico.nombre+" "+a.cita.medico.apellido:"")}
                </span>
              </div>
              <div style="display:flex;gap:8px;align-items:center">
                ${a.cita?.medico?.especialidad?`<span style="background:#dbeafe;color:#1d4ed8;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:700">${escH(a.cita.medico.especialidad.nombre)}</span>`:""}
                ${receta?`<a class="btn small secondary" href="${API_BASE}/reportes/receta/${a.idAtencion}" target="_blank" title="Descargar receta PDF" style="text-decoration:none;font-size:11px">📄 Receta</a>`:""}
              </div>
            </div>
            <div style="padding:12px 14px;display:grid;gap:8px">
              <div>
                <span style="font-size:11px;font-weight:700;color:var(--muted)">MOTIVO</span>
                <div style="color:var(--text);margin-top:2px">${escH(a.motivoConsulta||"—")}</div>
              </div>
              <div>
                <span style="font-size:11px;font-weight:700;color:var(--muted)">DIAGNÓSTICO</span>
                <div style="color:var(--text);margin-top:2px;font-weight:700">${escH(a.diagnostico||"—")}</div>
              </div>
              ${a.observaciones?`
              <div>
                <span style="font-size:11px;font-weight:700;color:var(--muted)">OBSERVACIONES</span>
                <div style="color:var(--muted);margin-top:2px;font-size:13px">${escH(a.observaciones)}</div>
              </div>`:""}
            </div>
          </div>`;
        }).join("")}
      </div>`
      :`<div class="empty">Aún no tienes atenciones médicas registradas.</div>`}
    </div>
  </section>

  <!-- Recetas disponibles -->
  ${recetas.length?`
  <section class="panel">
    <div class="panel-header">
      <h3>💊 Mis recetas</h3>
      <span style="color:var(--muted);font-size:13px">${recetas.length} receta(s)</span>
    </div>
    <div class="panel-body">
      <div style="display:grid;gap:10px">
        ${recetas.map(r=>{
          const at=atenciones.find(a=>a.idAtencion===r.atencion?.idAtencion);
          return`
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border:1px solid var(--line);border-radius:8px">
            <div>
              <div style="font-weight:700">Receta ${escH(r.idReceta||"")}</div>
              <div style="color:var(--muted);font-size:13px">
                ${escH(r.fechaEmision?r.fechaEmision.split("T")[0]:"—")}
                ${at?` · Dr(a). ${escH(at.cita?.medico?.nombre||"")} ${escH(at.cita?.medico?.apellido||"")}`:""} 
              </div>
            </div>
            <a class="btn small secondary"
               href="${API_BASE}/reportes/receta/${r.atencion?.idAtencion}"
               target="_blank"
               style="text-decoration:none">
               📄 Descargar PDF
            </a>
          </div>`;
        }).join("")}
      </div>
    </div>
  </section>`:""}`;
}
function patientCancelarView(){
  const patient=currentPatient();
  const citas=patient?state.db.citas.filter(c=>c.paciente?.idPaciente===patient.idPaciente&&["PENDIENTE","CONFIRMADA"].includes(c.estado)):[];
  return`
  ${viewHeader("Cancelar cita","Anulación de reservas pendientes o confirmadas.")}
  <section class="panel">
    <div class="panel-header"><h3>Citas disponibles para cancelar</h3></div>
    <div class="panel-body">${citasTablePaciente(citas,true)}</div>
  </section>`;
}
 
// ══════════════════════════════════════════════════════════
//  TABLAS
// ══════════════════════════════════════════════════════════
function citasTableCompact(rows){
  if(!rows.length) return`<div class="empty">No hay citas registradas.</div>`;
  return`<div class="timeline">
    ${rows.map(c=>`<div class="timeline-item">
      <strong>${escH(c.paciente?c.paciente.nombre+" "+c.paciente.apellido:"—")}</strong>
      <span>${escH(c.fechaCita||"")} · ${escH(c.medico?c.medico.nombre+" "+c.medico.apellido:"—")} · ${statusBadge(c.estado)}</span>
    </div>`).join("")}
  </div>`;
}
 
function citasTableAdmin(rows){
  if(!rows.length) return`<div class="empty">No hay citas para mostrar.</div>`;
  return`<div class="table-wrap"><table>
    <thead><tr><th>ID</th><th>Paciente</th><th>Médico</th><th>Fecha</th><th>Hora</th><th>Estado</th><th>Acciones</th></tr></thead>
    <tbody>
      ${rows.map(c=>`<tr>
        <td style="font-size:12px;color:var(--muted)">${escH(c.idCita||"")}</td>
        <td>${escH(c.paciente?c.paciente.nombre+" "+c.paciente.apellido:"—")}</td>
        <td>${escH(c.medico?c.medico.nombre+" "+c.medico.apellido:"—")}</td>
        <td>${escH(c.fechaCita||"")}</td>
        <td>${escH(c.horaInicio||"")} - ${escH(c.horaFin||"")}</td>
        <td>${statusBadge(c.estado)}</td>
        <td><div class="button-row">
          ${c.estado==="PENDIENTE"?`<button class="btn small secondary" data-action="confirm-cita" data-id="${c.idCita}">✅ Confirmar</button>`:""}
          ${c.estado!=="CANCELADA"&&c.estado!=="ATENDIDA"?`<button class="btn small danger" data-action="cancel-cita" data-id="${c.idCita}">❌ Cancelar</button>`:""}
        </div></td>
      </tr>`).join("")}
    </tbody>
  </table></div>`;
}
 
function citasTableDoctor(rows){
  if(!rows.length) return`<div class="empty">No hay citas asignadas.</div>`;
  // Buscar la atención asociada a cada cita para el botón de receta
  return`<div class="table-wrap"><table>
    <thead><tr><th>Paciente</th><th>Fecha</th><th>Hora</th><th>Motivo</th><th>Estado</th><th>Acciones</th></tr></thead>
    <tbody>
      ${rows.map(c=>{
        // Buscar la atención vinculada a esta cita
        const atencion=state.db.atenciones.find(a=>a.cita?.idCita===c.idCita||a.idCita===c.idCita);
        const idAtencion=atencion?.idAtencion||"";
        return`<tr>
          <td><strong>${escH(c.paciente?c.paciente.nombre+" "+c.paciente.apellido:"—")}</strong></td>
          <td>${escH(c.fechaCita||"")}</td>
          <td>${escH(c.horaInicio||"")} - ${escH(c.horaFin||"")}</td>
          <td>${escH(c.motivo||"")}</td>
          <td>${statusBadge(c.estado)}</td>
          <td><div class="button-row">
            ${c.estado!=="ATENDIDA"&&c.estado!=="CANCELADA"
              ?`<button class="btn small secondary" data-action="attend-cita" data-id="${c.idCita}">🩺 Atender</button>
                <button class="btn small danger" data-action="cancel-cita" data-id="${c.idCita}">❌ Cancelar</button>`
              :""}
            ${c.estado==="ATENDIDA"&&idAtencion
              ?`<a class="btn small secondary"
                   href="${API_BASE}/reportes/receta/${idAtencion}"
                   target="_blank"
                   title="Descargar receta PDF"
                   style="text-decoration:none">
                   📄 Receta PDF
                 </a>`
              :""}
            ${c.estado==="ATENDIDA"&&idAtencion
              ?`<button class="btn small ghost" data-action="enviar-receta" data-id="${idAtencion}" title="Enviar receta por correo al paciente">
                   📧 Enviar
                 </button>`
              :""}
          </div></td>
        </tr>`;
      }).join("")}
    </tbody>
  </table></div>`;
}
 
function citasTablePaciente(rows,showCancel){
  if(!rows.length) return`<div class="empty">No hay citas para mostrar.</div>`;
  return`<div class="table-wrap"><table>
    <thead><tr><th>Médico</th><th>Fecha</th><th>Hora</th><th>Motivo</th><th>Estado</th>${showCancel?"<th></th>":""}</tr></thead>
    <tbody>
      ${rows.map(c=>`<tr>
        <td>${escH(c.medico?c.medico.nombre+" "+c.medico.apellido:"—")}</td>
        <td>${escH(c.fechaCita||"")}</td>
        <td>${escH(c.horaInicio||"")} - ${escH(c.horaFin||"")}</td>
        <td>${escH(c.motivo||"")}</td>
        <td>${statusBadge(c.estado)}</td>
        ${showCancel?`<td><button class="btn small danger" data-action="cancel-cita" data-id="${c.idCita}">Cancelar</button></td>`:""}
      </tr>`).join("")}
    </tbody>
  </table></div>`;
}
 
function atencionesTable(rows){
  if(!rows.length) return`<div class="empty">No hay historial registrado.</div>`;
  return`<div class="table-wrap"><table>
    <thead><tr><th>ID</th><th>Paciente</th><th>Fecha</th><th>Motivo</th><th>Diagnóstico</th></tr></thead>
    <tbody>
      ${rows.map(a=>`<tr>
        <td style="font-size:12px;color:var(--muted)">${escH(a.idAtencion||"")}</td>
        <td>${escH(a.cita?.paciente?a.cita.paciente.nombre+" "+a.cita.paciente.apellido:"—")}</td>
        <td>${escH(a.fechaAtencion?a.fechaAtencion.split("T")[0]:"")}</td>
        <td>${escH(a.motivoConsulta||"")}</td>
        <td>${escH(a.diagnostico||"")}</td>
      </tr>`).join("")}
    </tbody>
  </table></div>`;
}
 
function usuariosTable(usuarios){
  if(!usuarios.length) return`<div class="empty">No hay usuarios que coincidan.</div>`;
  return`<div class="table-wrap"><table>
    <thead><tr><th>Usuario</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
    <tbody>
      ${usuarios.map(u=>`<tr>
        <td><strong>${escH(u.username)}</strong><div style="font-size:11px;color:var(--muted)">${escH(u.idUsuario)}</div></td>
        <td>${escH(u.email)}</td>
        <td>${escH(u.rol?.nombre||"")}</td>
        <td>${statusBadge(u.estado)}</td>
        <td><div class="button-row">
          <button class="btn small secondary" data-action="edit-user" data-id="${u.idUsuario}">✏️</button>
          ${u.estado==="ACTIVO"
            ?`<button class="btn small danger" data-action="deactivate-user" data-id="${u.idUsuario}">Desactivar</button>`
            :`<button class="btn small secondary" data-action="activate-user" data-id="${u.idUsuario}">Activar</button>`}
        </div></td>
      </tr>`).join("")}
    </tbody>
  </table></div>`;
}
 
function medicosTable(medicos){
  if(!medicos.length) return`<div class="empty">No hay médicos que coincidan.</div>`;
  return`<div class="table-wrap"><table>
    <thead><tr><th>Médico</th><th>Especialidad</th><th>Teléfono</th><th>Acciones</th></tr></thead>
    <tbody>
      ${medicos.map(m=>`<tr>
        <td><strong>${escH(m.nombre+" "+m.apellido)}</strong><div style="font-size:11px;color:var(--muted)">${escH(m.idMedico)}</div></td>
        <td>${escH(m.especialidad?.nombre||"—")}</td>
        <td>${escH(m.telefono||"—")}</td>
        <td><div class="button-row">
          <button class="btn small secondary" data-action="edit-medico" data-id="${m.idMedico}">✏️ Editar</button>
        </div></td>
      </tr>`).join("")}
    </tbody>
  </table></div>`;
}
 
function especialidadesTable(esp){
  if(!esp.length) return`<div class="empty">No hay especialidades registradas.</div>`;
  return`<div class="table-wrap"><table>
    <thead><tr><th>ID</th><th>Nombre</th><th>Descripción</th><th>Acciones</th></tr></thead>
    <tbody>
      ${esp.map(e=>`<tr>
        <td style="font-size:12px;color:var(--muted)">${escH(String(e.idEspecialidad))}</td>
        <td><strong>${escH(e.nombre)}</strong></td>
        <td>${escH(e.descripcion||"—")}</td>
        <td><div class="button-row">
          <button class="btn small secondary" data-action="edit-especialidad" data-id="${e.idEspecialidad}">✏️</button>
        </div></td>
      </tr>`).join("")}
    </tbody>
  </table></div>`;
}
 
function horariosTable(horarios){
  if(!horarios.length) return`<div class="empty">No hay horarios registrados para este médico.</div>`;
  return`<div class="table-wrap"><table>
    <thead><tr><th>Día</th><th>Inicio</th><th>Fin</th><th>Estado</th><th></th></tr></thead>
    <tbody>
      ${horarios.map(h=>`<tr>
        <td><strong>${escH(h.diaSemana)}</strong></td>
        <td>${escH(h.horaInicio)}</td>
        <td>${escH(h.horaFin)}</td>
        <td>${statusBadge(h.estado||"ACTIVO")}</td>
        <td><button class="btn small danger" data-action="delete-horario" data-id="${h.idHorario}">🗑️</button></td>
      </tr>`).join("")}
    </tbody>
  </table></div>`;
}
 
// ══════════════════════════════════════════════════════════
//  COMPONENTES
// ══════════════════════════════════════════════════════════
function barChart(items){
  return`<div style="display:grid;gap:12px">
    ${items.map(({label,value,total,color})=>{
      const pct=total>0?Math.round(value/total*100):0;
      return`<div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:13px">
          <span>${escH(label)}</span>
          <span style="font-weight:700">${value} <span style="color:var(--muted);font-weight:400">(${pct}%)</span></span>
        </div>
        <div style="height:10px;background:#e5e7eb;border-radius:999px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${color};border-radius:999px;transition:width .4s"></div>
        </div>
      </div>`;
    }).join("")}
  </div>`;
}
 
function scheduleRow(day,value){
  const start=value?.[0]?value[0].substring(0,5):"Seleccione";
  const end=value?.[1]?value[1].substring(0,5):"Seleccione";
  const active=start!=="Seleccione";
  return`<div class="schedule-row" style="${active?"background:#f0faf8;border-radius:6px;padding:4px 6px":""}">
    <div class="day-name" style="${active?"color:var(--primary)":""}">${day}</div>
    <select name="${day}-start">${hourOptions(start)}</select>
    <select name="${day}-end">${hourOptions(end)}</select>
  </div>`;
}
function hourOptions(sel){ return HOURS.map(h=>`<option value="${h}" ${h===sel?"selected":""}>${h}</option>`).join(""); }
function viewHeader(title,subtitle){ return`<div class="view-title"><div><h1>${title}</h1><p>${subtitle}</p></div></div>`; }
function statCard(value,label){ return`<div class="stat-card"><strong>${value}</strong><span>${label}</span></div>`; }
function statusBadge(s){
  const m={ACTIVO:"ok",INACTIVO:"bad",PENDIENTE:"warn",CONFIRMADA:"info",ATENDIDA:"ok",CANCELADA:"bad",DISPONIBLE:"ok",EN_ESPERA:"warn"};
  return`<span class="status ${m[s]||"info"}">${escH(s||"")}</span>`;
}
function roleLabel(role){ 
  return{ADMINISTRADOR:"Administrador",MEDICO:"Médico",PACIENTE:"Paciente"}[role]||(state.user?.rol?.nombre||role); 
}
function viewTitle(view){
  const all=[...NAV.ADMINISTRADOR,...NAV.MEDICO,...NAV.PACIENTE];
  return(all.find(([k])=>k===view)?.[1]||"Dashboard").replace(/^[^\s]+\s/,"");
}
function escH(v){ return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;"); }
function escA(v){ return escH(v).replaceAll("'","&#39;"); }
function nextId(prefix,rows,key){
  const max=rows.reduce((h,r)=>{const n=Number(String(r[key]||"").replace(`${prefix}-`,""));return isFinite(n)?Math.max(h,n):h;},0);
  return`${prefix}-${String(max+1).padStart(4,"0")}`;
}
function timeToMinutes(value){
  const [h,m]=String(value||"").split(":").map(Number);
  if(!Number.isFinite(h)||!Number.isFinite(m)) return NaN;
  return h*60+m;
}
function normalizeTime(value){
  const [h,m]=String(value||"").split(":");
  if(h==null||m==null) return "";
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}
function dayKeyFromDate(value){
  if(!value) return "";
  const [year,month,day]=String(value).split("-").map(Number);
  if(!year||!month||!day) return "";
  const keys=["DOMINGO","LUNES","MARTES","MIERCOLES","JUEVES","VIERNES","SABADO"];
  return keys[new Date(year,month-1,day).getDay()];
}
function activeScheduleForDate(doctorId,date){
  const dayKey=dayKeyFromDate(date);
  if(!doctorId||!dayKey) return null;
  return state.db.horarios.find(h=>
    h.medico?.idMedico===doctorId &&
    h.diaSemana===dayKey &&
    String(h.estado||"").toUpperCase()==="ACTIVO"
  )||null;
}
function scheduleHourOptions(schedule,type,startValue=""){
  if(!schedule) return "";
  const startLimit=timeToMinutes(schedule.horaInicio);
  const endLimit=timeToMinutes(schedule.horaFin);
  const startMinutes=timeToMinutes(startValue);
  return HOURS.filter(h=>{
    if(h==="Seleccione") return false;
    const minutes=timeToMinutes(h);
    if(type==="start") return minutes>=startLimit && minutes<endLimit;
    return minutes>endLimit?false:minutes>startMinutes;
  }).map(h=>`<option value="${h}" ${h===startValue?"selected":""}>${h}</option>`).join("");
}

function openAttendModal(cita){
  closeAttendModal();
  const paciente=cita.paciente?`${cita.paciente.nombre} ${cita.paciente.apellido}`:"Paciente";
  const meds=state.db.medicamentos||[];
  // Lista temporal de medicamentos agregados (se acumula antes de guardar)
  window._recetaMeds=[];

  const modal=document.createElement("div");
  modal.className="modal-backdrop";
  modal.id="attend-modal";
  modal.innerHTML=`
    <section class="modal-card modal-card-lg" role="dialog" aria-modal="true" aria-labelledby="attend-title">
      <div class="modal-header">
        <div>
          <h2 id="attend-title">Registrar atención</h2>
          <p style="color:var(--muted);font-size:13px">${escH(paciente)} · ${escH(cita.fechaCita||"")} ${escH(cita.horaInicio||"")}</p>
        </div>
        <button class="btn ghost small" type="button" data-action="close-attend-modal">Cerrar</button>
      </div>
      <form id="attend-form" class="form-grid">
        <input type="hidden" name="idCita" value="${escA(cita.idCita)}"/>

        <!-- MOTIVO Y DIAGNÓSTICO -->
        <div class="form-row">
          <div class="field">
            <label>Motivo de consulta</label>
            <textarea name="motivo" rows="3" required placeholder="Describe el motivo por el que acude el paciente"></textarea>
          </div>
          <div class="field">
            <label>Diagnóstico</label>
            <textarea name="diagnostico" rows="3" required placeholder="Registra el diagnóstico clínico"></textarea>
          </div>
        </div>

        <!-- SECCIÓN MEDICAMENTOS -->
        <div style="border:1px solid var(--line);border-radius:8px;padding:14px">
          <div style="font-size:13px;font-weight:700;color:var(--primary);margin-bottom:12px">💊 Medicamentos prescritos</div>

          <!-- Fila para agregar medicamento -->
          <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr auto;gap:8px;align-items:end;margin-bottom:10px">
            <div class="field" style="margin:0">
              <label style="font-size:11px">Medicamento</label>
              <select id="med-select">
                <option value="">— Seleccione —</option>
                ${meds.map(m=>`<option value="${m.idMedicamento}" data-nombre="${escA(m.nombre)}" data-conc="${escA(m.concentracion||"")}">
                  ${escH(m.nombre)} ${escH(m.concentracion||"")}
                </option>`).join("")}
              </select>
            </div>
            <div class="field" style="margin:0">
              <label style="font-size:11px">Dosis</label>
              <input id="med-dosis" placeholder="Ej: 1 tableta"/>
            </div>
            <div class="field" style="margin:0">
              <label style="font-size:11px">Frecuencia</label>
              <input id="med-frec" placeholder="Ej: Cada 8 horas"/>
            </div>
            <div class="field" style="margin:0">
              <label style="font-size:11px">Duración</label>
              <input id="med-dur" placeholder="Ej: Por 7 días"/>
            </div>
            <button class="btn small secondary" type="button" id="btn-add-med" style="margin-bottom:2px">➕ Agregar</button>
          </div>

          <!-- Tabla de medicamentos agregados -->
          <div id="meds-list">
            <div class="empty" id="meds-empty" style="padding:12px;font-size:13px">No se han agregado medicamentos aún.</div>
          </div>
        </div>

        <!-- OBSERVACIONES -->
        <div class="field">
          <label>Observaciones / indicaciones</label>
          <textarea name="observaciones" rows="2" placeholder="Indicaciones adicionales, reposo, controles u otros detalles"></textarea>
        </div>

        <div class="button-row modal-actions">
          <button class="btn" type="submit">💾 Guardar y generar PDF</button>
          <button class="btn secondary" type="button" data-action="close-attend-modal">Cancelar</button>
        </div>
      </form>
    </section>`;

  app.appendChild(modal);

  // Renderizar tabla de medicamentos agregados
  function renderMedsList(){
    const list=document.getElementById("meds-list");
    const empty=document.getElementById("meds-empty");
    if(!window._recetaMeds.length){
      if(empty) empty.style.display="";
      // Quitar tabla si existe
      list.querySelector("table")?.remove();
      return;
    }
    if(empty) empty.style.display="none";
    // Crear o actualizar tabla
    let table=list.querySelector("table");
    if(!table){
      table=document.createElement("table");
      table.style.cssText="width:100%;border-collapse:collapse;font-size:12px";
      table.innerHTML=`<thead style="background:#f8fafc"><tr>
        <th style="padding:8px;text-align:left;border-bottom:1px solid var(--line)">Medicamento</th>
        <th style="padding:8px;text-align:left;border-bottom:1px solid var(--line)">Dosis</th>
        <th style="padding:8px;text-align:left;border-bottom:1px solid var(--line)">Frecuencia</th>
        <th style="padding:8px;text-align:left;border-bottom:1px solid var(--line)">Duración</th>
        <th style="padding:8px;border-bottom:1px solid var(--line)"></th>
      </tr></thead><tbody></tbody>`;
      list.appendChild(table);
    }
    const tbody=table.querySelector("tbody");
    tbody.innerHTML=window._recetaMeds.map((m,i)=>`<tr>
      <td style="padding:7px 8px;border-bottom:1px solid var(--line)">${escH(m.nombre)}</td>
      <td style="padding:7px 8px;border-bottom:1px solid var(--line)">${escH(m.dosis)}</td>
      <td style="padding:7px 8px;border-bottom:1px solid var(--line)">${escH(m.frecuencia)}</td>
      <td style="padding:7px 8px;border-bottom:1px solid var(--line)">${escH(m.duracion)}</td>
      <td style="padding:7px 8px;border-bottom:1px solid var(--line);text-align:center">
        <button type="button" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:14px" data-rm-med="${i}">🗑️</button>
      </td>
    </tr>`).join("");

    // Botones eliminar fila
    tbody.querySelectorAll("[data-rm-med]").forEach(btn=>{
      btn.addEventListener("click",()=>{
        window._recetaMeds.splice(Number(btn.dataset.rmMed),1);
        renderMedsList();
      });
    });
  }

  // Botón Agregar medicamento
  document.getElementById("btn-add-med").addEventListener("click",()=>{
    const sel=document.getElementById("med-select");
    const dosis=document.getElementById("med-dosis").value.trim();
    const frec=document.getElementById("med-frec").value.trim();
    const dur=document.getElementById("med-dur").value.trim();
    const opt=sel.options[sel.selectedIndex];
    if(!sel.value){toast("Selecciona un medicamento.","error");return;}
    if(!dosis){toast("Ingresa la dosis.","error");return;}
    if(!frec){toast("Ingresa la frecuencia.","error");return;}
    if(!dur){toast("Ingresa la duración.","error");return;}
    window._recetaMeds.push({
      idMedicamento:sel.value,
      nombre:opt.dataset.nombre||opt.text,
      dosis,frecuencia:frec,duracion:dur
    });
    // Limpiar campos
    sel.value="";
    document.getElementById("med-dosis").value="";
    document.getElementById("med-frec").value="";
    document.getElementById("med-dur").value="";
    renderMedsList();
  });

  modal.querySelector("textarea")?.focus();
}

function closeAttendModal(){
  document.getElementById("attend-modal")?.remove();
}
 
// ══════════════════════════════════════════════════════════
//  EVENTOS
// ══════════════════════════════════════════════════════════
app.addEventListener("click",e=>{
  const authMode=e.target.closest("[data-auth-mode]");
  if(authMode){state.message="";renderAuth(authMode.dataset.authMode);return;}
 
  const viewBtn=e.target.closest("[data-view]");
  if(viewBtn){
    state.view=viewBtn.dataset.view;
    state.message="";
    state.scheduleSpecialty="";
    state.scheduleDoctor="";
    renderShell();
    return;
  }
 
  const filterBtn=e.target.closest("[data-filter-cita]");
  if(filterBtn){state.citaFilter=filterBtn.dataset.filterCita;renderView();return;}
 
  const action=e.target.closest("[data-action]");
  if(action) handleAction(action.dataset.action,action.dataset.id).catch(err=>toast(err.message,"error"));
});
 
app.addEventListener("change",e=>{
  if(e.target.id==="schedule-specialty"){state.scheduleSpecialty=e.target.value;state.scheduleDoctor="";renderView();}
  if(e.target.id==="schedule-doctor"){state.scheduleDoctor=e.target.value;renderView();}
  if(e.target.id==="book-specialty"){state.scheduleSpecialty=e.target.value;state.scheduleDoctor="";state.bookStart="";renderView();}
  if(e.target.id==="book-doctor"){
    state.scheduleDoctor=e.target.value;
    state.bookStart="";
    state.horasOcupadas=[];
    if(state.bookDate&&state.scheduleDoctor){
      apiGet(`/citas/ocupadas?idMedico=${state.scheduleDoctor}&fecha=${state.bookDate}`)
        .then(data=>{state.horasOcupadas=data;renderView();}).catch(()=>{});
    }
    renderView();
  }
  if(e.target.id==="book-date"){
    state.bookDate=e.target.value;
    state.bookStart="";
    state.horasOcupadas=[];
    if(state.bookDate&&state.scheduleDoctor){
      apiGet(`/citas/ocupadas?idMedico=${state.scheduleDoctor}&fecha=${state.bookDate}`)
        .then(data=>{state.horasOcupadas=data;renderView();}).catch(()=>{});
    }
    renderView();
  }
  if(e.target.id==="book-start"){state.bookStart=e.target.value;renderView();}
  if(e.target.dataset.search==="usuario"){state.usuarioSearch=e.target.value;renderView();}
  if(e.target.dataset.search==="medico"){state.medicoSearch=e.target.value;renderView();}
});
 
app.addEventListener("input",e=>{
  if(e.target.dataset.search==="usuario"){state.usuarioSearch=e.target.value;renderView();}
  if(e.target.dataset.search==="medico"){state.medicoSearch=e.target.value;renderView();}
});
 
app.addEventListener("submit",e=>{
  e.preventDefault();
  const form=e.target.closest("form")||e.target;
  // IMPORTANTE: usar getAttribute("id") porque form.id puede colisionar
  // con un <input name="id"> dentro del formulario
  const id=form.getAttribute("id");
  console.log("📋 Submit en form id:", id);
  if(id==="login-form")          handleLogin(form).catch(err=>showAuthError(err.message));
  if(id==="register-form")       handleRegister(form).catch(err=>showAuthError(err.message));
  if(id==="user-form")           handleUserForm(form).catch(err=>toast(err.message,"error"));
  if(id==="medico-form")         handleMedicoForm(form).catch(err=>toast(err.message,"error"));
  if(id==="especialidad-form")   handleEspecialidadForm(form).catch(err=>toast(err.message,"error"));
  if(id==="schedule-form")       handleScheduleForm(form).catch(err=>toast(err.message,"error"));
  if(id==="book-form")           handleBookForm(form).catch(err=>toast(err.message,"error"));
  if(id==="attend-form")         handleAttendForm(form).catch(err=>toast(err.message,"error"));
});
 
function showAuthError(msg){
  state.message=msg;
  const el=document.getElementById("auth-alert");
  if(el){el.textContent=msg;el.classList.add("show");}
}
 
// ══════════════════════════════════════════════════════════
//  HANDLERS DE FORMULARIOS
// ══════════════════════════════════════════════════════════
async function handleLogin(form){
  const data=new FormData(form);
  const login=String(data.get("login")).trim().toLowerCase();
  const password=String(data.get("password"));
  const user=await loginLocal(login,password);
  state.user=user; state.rolNombre=normalizarRol(user.rol?.nombre);
  localStorage.setItem("posta_user",JSON.stringify(user));
  state.view="dashboard"; state.message="";
  await refreshDb(); render();
}
 
async function handleRegister(form){
  const data=new FormData(form);
  const nombre=String(data.get("nombre")).trim();
  const apellidoP=String(data.get("apellidoP")).trim();
  const apellidoM=String(data.get("apellidoM")).trim();
  const dni=String(data.get("dni")).trim();
  const email=String(data.get("email")).trim().toLowerCase();
  const telefono=String(data.get("telefono")||"").trim();
  const fechaNacimiento=String(data.get("fechaNacimiento")||"");
  const sexo=String(data.get("sexo")||"M");
  const password=String(data.get("password"));
  const confirm=String(data.get("confirm"));
  if(!/^\d{8}$/.test(dni)) throw new Error("El DNI debe tener exactamente 8 dígitos.");
  if(password.length<6) throw new Error("La contraseña debe tener al menos 6 caracteres.");
  if(password!==confirm) throw new Error("Las contraseñas no coinciden.");
  const username=(nombre[0]+apellidoP).toLowerCase().replace(/\s+/g,"");
  await refreshDb();
  const rolPaciente=state.db.roles.find(r=>r.nombre==="PACIENTE")||{idRol:3};
  const idUsuario=nextId("USR",state.db.usuarios,"idUsuario");
  const nuevoUsuario=await apiPost("/usuarios",{idUsuario,username,email,passwordHash:password,estado:"ACTIVO",rol:{idRol:rolPaciente.idRol}});
  const idPaciente=nextId("PAC",state.db.pacientes,"idPaciente");
  await apiPost("/pacientes",{idPaciente,usuario:{idUsuario:nuevoUsuario.idUsuario},dni,nombre:`${nombre} ${apellidoM}`,apellido:apellidoP,telefono,fechaNacimiento:fechaNacimiento||null,sexo});
  state.message=`✅ Cuenta creada. Tu usuario es: ${username}`;
  renderAuth("login");
}
 
async function handleUserForm(form){
  const data=new FormData(form);
  const id=String(data.get("idItem")||"").trim();
  const username=String(data.get("username")||"").trim();
  const email=String(data.get("email")||"").trim().toLowerCase();
  const idRolRaw=data.get("idRol");
  const idRol=idRolRaw!==null&&idRolRaw!==""?Number(idRolRaw):null;
  const estado=String(data.get("estado")||"ACTIVO").trim();

  // Validaciones
  if(!username) throw new Error("El nombre de usuario es obligatorio.");
  if(!email) throw new Error("El correo electrónico es obligatorio.");
  if(idRol===null||isNaN(idRol)) throw new Error("Selecciona un rol válido.");

  // Deshabilitar botón mientras procesa
  const submit=form.querySelector("button[type='submit']");
  const textoOriginal=submit?.textContent||"Guardar";
  if(submit){submit.disabled=true;submit.textContent="Guardando...";}

  try{
    if(id){
      // EDITAR usuario existente — no tocar password
      await apiPut(`/usuarios/${id}`,{
        idUsuario:id,
        username,
        email,
        estado,
        rol:{idRol:idRol}
      });
      toast("✅ Usuario actualizado correctamente.");
    }else{
      // CREAR usuario nuevo
      const password=String(data.get("password")||"").trim();
      if(!password) throw new Error("La contraseña es obligatoria para nuevos usuarios.");
      if(password.length<6) throw new Error("La contraseña debe tener al menos 6 caracteres.");
      await refreshDb();
      const newId=nextId("USR",state.db.usuarios,"idUsuario");
      await apiPost("/usuarios",{
        idUsuario:newId,
        username,
        email,
        passwordHash:password,
        estado,
        rol:{idRol:idRol}
      });
      toast("✅ Usuario creado correctamente.");
    }
    await refreshDb();
    state.selectedUserId="";
    renderView();
  }catch(e){
    if(submit){submit.disabled=false;submit.textContent=textoOriginal;}
    throw e;
  }
}
 
async function handleMedicoForm(form){
  const data=new FormData(form);
  const id=String(data.get("idItem")||"").trim();
  const nombre=String(data.get("nombre")).trim();
  const apellido=String(data.get("apellido")).trim();
  const telefono=String(data.get("telefono")||"").trim();
  const sexo=String(data.get("sexo")||"M");
  const fechaNacimiento=String(data.get("fechaNacimiento")||"");
  const idEspecialidad=Number(data.get("idEspecialidad"));
  if(!nombre||!apellido) throw new Error("Nombre y apellido son obligatorios.");
  if(!idEspecialidad) throw new Error("Selecciona una especialidad.");
  if(id){
    await apiPut(`/medicos/${id}`,{nombre,apellido,telefono,sexo,fechaNacimiento:fechaNacimiento||null,especialidad:{idEspecialidad}});
    toast("Médico actualizado correctamente.");
  }else{
    const idUsuario=String(data.get("idUsuario")||"").trim();
    if(!idUsuario) throw new Error("Debes ingresar el ID del usuario vinculado.");
    await refreshDb();
    const newId=nextId("MED",state.db.medicos,"idMedico");
    await apiPost("/medicos",{idMedico:newId,nombre,apellido,telefono,sexo,fechaNacimiento:fechaNacimiento||null,usuario:{idUsuario},especialidad:{idEspecialidad}});
    toast("Médico creado correctamente.");
  }
  await refreshDb(); state.selectedUserId=""; renderView();
}
 
async function handleEspecialidadForm(form){
  const data=new FormData(form);
  const id=String(data.get("idItem")||"").trim();
  const nombre=String(data.get("nombre")).trim();
  const descripcion=String(data.get("descripcion")||"").trim();
  if(!nombre) throw new Error("El nombre de la especialidad es obligatorio.");
  if(id){
    await apiPut(`/especialidad/${id}`,{nombre,descripcion});
    toast("Especialidad actualizada.");
  }else{
    await refreshDb();
    const newId=nextId("ESP",state.db.especialidades,"idEspecialidad");
    await apiPost("/especialidad",{idEspecialidad:newId,nombre,descripcion});
    toast("Especialidad creada.");
  }
  await refreshDb(); state.selectedEspecialidadId=""; renderView();
}
 
async function handleScheduleForm(form){
  const data=new FormData(form);
  const doctorId=String(data.get("doctorId"));
  if(!doctorId||doctorId.includes("Sin médicos")) throw new Error("Selecciona un médico válido.");
  let saved=0;
  for(const day of DAYS){
    const start=String(data.get(`${day}-start`));
    const end=String(data.get(`${day}-end`));
    if(start==="Seleccione"||end==="Seleccione") continue;
    if(end<=start){toast(`Hora inválida en ${day}. La hora de fin debe ser mayor.`,"error");return;}
    const existing=state.db.horarios.find(h=>h.medico?.idMedico===doctorId&&h.diaSemana===DAY_MAP[day]);
    if(existing){
      await apiPut(`/horarios/${existing.idHorario}`,{medico:{idMedico:doctorId},diaSemana:DAY_MAP[day],horaInicio:start,horaFin:end,estado:existing.estado||"ACTIVO"});
    }else{
      await apiPost("/horarios",{medico:{idMedico:doctorId},diaSemana:DAY_MAP[day],horaInicio:start,horaFin:end,estado:"ACTIVO"});
    }
    saved++;
  }
  await refreshDb(); renderView();
  if(saved>0) toast(`Horario guardado: ${saved} día(s) actualizado(s).`);
  else toast("No se seleccionaron horas. Nada fue guardado.","info");
}
 
async function handleBookForm(form){
  const patient=currentPatient();
  if(!patient) throw new Error("No se encontró el perfil de paciente.");
  const data=new FormData(form);
  const doctorId=String(data.get("doctorId"));
  const consultorioId=Number(data.get("consultorioId"));
  const date=String(data.get("date"));
  const start=String(data.get("start"));
  const end=String(data.get("end"));
  const reason=String(data.get("reason")).trim();
  if(!doctorId||!date||!reason) throw new Error("Completa todos los campos obligatorios.");
  if(!start||!end) throw new Error("Selecciona un horario disponible.");
  if(end<=start) throw new Error("La hora de fin debe ser mayor a la hora de inicio.");

  // Validar conflicto en el frontend antes de enviar al backend
  const ocupadas=await apiGet(`/citas/ocupadas?idMedico=${doctorId}&fecha=${date}`);
  const hayConflicto=ocupadas.some(o=>{
    const oIni=o.horaInicio.substring(0,5);
    const oFin=o.horaFin.substring(0,5);
    return start<oFin && end>oIni; // solapamiento
  });
  if(hayConflicto){
    const detalle=ocupadas.map(o=>`${o.horaInicio.substring(0,5)}-${o.horaFin.substring(0,5)}`).join(", ");
    throw new Error(`⚠️ Horario no disponible. El médico ya tiene citas en: ${detalle}. Por favor elige otro horario.`);
  }
  await refreshDb();
  const schedule=activeScheduleForDate(doctorId,date);
  if(!schedule) throw new Error("El medico no tiene horario activo para esa fecha.");
  if(timeToMinutes(start)<timeToMinutes(schedule.horaInicio)||timeToMinutes(end)>timeToMinutes(schedule.horaFin)){
    throw new Error(`Selecciona un horario dentro de ${normalizeTime(schedule.horaInicio)} - ${normalizeTime(schedule.horaFin)}.`);
  }
  const newId=nextId("CIT",state.db.citas,"idCita");
  await apiPost("/citas",{idCita:newId,paciente:{idPaciente:patient.idPaciente},medico:{idMedico:doctorId},consultorio:{idConsultorio:consultorioId},fechaCita:date,horaInicio:start,horaFin:end,motivo:reason,estado:"PENDIENTE"});
  await refreshDb(); state.view="mis-citas"; toast("¡Cita registrada exitosamente!"); renderShell();
}
 
// ══════════════════════════════════════════════════════════
//  ACCIONES DE BOTONES
// ══════════════════════════════════════════════════════════
async function handleAttendForm(form){
  const data=new FormData(form);
  const id=String(data.get("idCita"));
  const cita=state.db.citas.find(c=>c.idCita===id);
  if(!cita) throw new Error("No se encontró la cita seleccionada.");
  const motivo=String(data.get("motivo")||"").trim();
  const diagnostico=String(data.get("diagnostico")||"").trim();
  const observaciones=String(data.get("observaciones")||"").trim();
  if(!motivo) throw new Error("Ingresa el motivo de consulta.");
  if(!diagnostico) throw new Error("Ingresa el diagnóstico.");

  const submit=form.querySelector("button[type='submit']");
  if(submit){submit.disabled=true;submit.textContent="Guardando...";}

  try{
    // 1. Marcar cita como ATENDIDA
    await apiPut(`/citas/${id}`,{...cita,estado:"ATENDIDA"});
    await refreshDb();

    // 2. Crear atención
    const newAtencionId=nextId("ATE",state.db.atenciones,"idAtencion");
    await apiPost("/atencion",{
      idAtencion:newAtencionId,
      cita:{idCita:id},
      fechaAtencion:new Date().toISOString(),
      motivoConsulta:motivo,
      diagnostico
    });

    // 3. Crear receta vinculada a la atención
    const recetas=await apiGet("/recetas");
    const newRecetaId=nextId("REC",recetas,"idReceta");
    await apiPost("/recetas",{
      idReceta:newRecetaId,
      atencion:{idAtencion:newAtencionId},
      fechaEmision:new Date().toISOString(),
      observaciones,
      estado:"EMITIDA"
    });

    // 4. Guardar cada medicamento de la receta
    const medsAgregados=window._recetaMeds||[];
    if(medsAgregados.length>0){
      const recetaMeds=await apiGet("/receta-medicamentos");
      for(let i=0;i<medsAgregados.length;i++){
        const m=medsAgregados[i];
        const newRmId=nextId("RM",recetaMeds,`idRecetaMedicamento`);
        recetaMeds.push({idRecetaMedicamento:newRmId}); // evitar IDs duplicados en el loop
        await apiPost("/receta-medicamentos",{
          idRecetaMedicamento:newRmId,
          receta:{idReceta:newRecetaId},
          medicamento:{idMedicamento:m.idMedicamento},
          dosis:m.dosis,
          frecuencia:m.frecuencia,
          duracion:m.duracion,
          indicaciones:observaciones
        });
      }
    }

    // 5. Limpiar y mostrar resultado
    window._recetaMeds=[];
    closeAttendModal();
    toast(`✅ Atención registrada con ${medsAgregados.length} medicamento(s). Abriendo receta PDF...`);
    await refreshDb();
    renderView();

    // 6. Abrir PDF
    openPdf(`/reportes/receta/${newAtencionId}`);

  }catch(e){
    if(submit){submit.disabled=false;submit.textContent="💾 Guardar y generar PDF";}
    throw e;
  }
}

async function handleAction(action,id){
  if(action==="logout"){
    state.user=null; state.rolNombre=null; state.view="dashboard"; state.selectedUserId="";
    state.db={usuarios:[],pacientes:[],medicos:[],especialidades:[],consultorios:[],horarios:[],citas:[],atenciones:[],roles:[]};
    localStorage.removeItem("posta_user"); renderAuth("login"); return;
  }
 
  if(action==="new-user")          {state.selectedUserId=""; renderView(); return;}
  if(action==="edit-user")         {state.selectedUserId=id; renderView(); return;}
  if(action==="new-medico")        {state.selectedUserId=""; renderView(); return;}
  if(action==="edit-medico")       {state.selectedUserId=id; renderView(); return;}
  if(action==="new-especialidad")  {state.selectedEspecialidadId=""; renderView(); return;}
  if(action==="edit-especialidad") {state.selectedEspecialidadId=id; renderView(); return;}
  if(action==="close-attend-modal"){closeAttendModal(); return;}
 
  if(action==="deactivate-user"){
    const user=state.db.usuarios.find(u=>u.idUsuario===id); if(!user) return;
    await apiPut(`/usuarios/${id}`,{...user,estado:"INACTIVO",rol:user.rol});
    toast("Usuario desactivado."); await refreshDb(); renderView(); return;
  }
  if(action==="activate-user"){
    const user=state.db.usuarios.find(u=>u.idUsuario===id); if(!user) return;
    await apiPut(`/usuarios/${id}`,{...user,estado:"ACTIVO",rol:user.rol});
    toast("Usuario activado."); await refreshDb(); renderView(); return;
  }
  /*if(action==="delete-medico"){
    if(!confirm("¿Eliminar este médico? Esta acción no se puede deshacer.")) return;
    await apiDelete(`/medicos/${id}`); toast("Médico eliminado."); await refreshDb(); renderView(); return;
  }
  if(action==="delete-especialidad"){
    if(!confirm("¿Eliminar esta especialidad?")) return;
    await apiDelete(`/especialidad/${id}`); toast("Especialidad eliminada."); await refreshDb(); renderView(); return;
  } */

  if(action==="delete-horario"){
    if(!confirm("¿Eliminar este horario?")) return;
    await apiDelete(`/horarios/${id}`); toast("Horario eliminado."); await refreshDb(); renderView(); return;
  }
  if(action==="confirm-cita"){
    const cita=state.db.citas.find(c=>c.idCita===id); if(!cita) return;
    await apiPut(`/citas/${id}`,{...cita,estado:"CONFIRMADA"});
    toast("Cita confirmada."); await refreshDb(); renderView(); return;
  }
  if(action==="cancel-cita"){
    if(!confirm("¿Cancelar esta cita?")) return;
    const cita=state.db.citas.find(c=>c.idCita===id); if(!cita) return;
    await apiPut(`/citas/${id}`,{...cita,estado:"CANCELADA"});
    toast("Cita cancelada."); await refreshDb(); renderView(); return;
  }
  if(action==="attend-cita"){
    const cita=state.db.citas.find(c=>c.idCita===id); if(!cita) return;
    openAttendModal(cita);
    return;
    const motivo=prompt("Motivo de la consulta:"); if(!motivo) return;
    const diagnostico=prompt("Diagnóstico:"); if(!diagnostico) return;
    const observaciones=prompt("Observaciones / indicaciones (opcional):") || "";
    await apiPut(`/citas/${id}`,{...cita,estado:"ATENDIDA"});
    await refreshDb();
    const newAtencionId=nextId("ATE",state.db.atenciones,"idAtencion");
    await apiPost("/atencion",{
      idAtencion:newAtencionId,
      cita:{idCita:id},
      fechaAtencion:new Date().toISOString(),
      motivoConsulta:motivo,
      diagnostico,
      observaciones
    });
    toast("✅ Atención registrada. Generando receta PDF...");
    await refreshDb();
    renderView();
    openPdf(`/reportes/receta/${newAtencionId}`);
    return;
  }
 
  if(action==="enviar-receta"){
    // id aquí es el idAtencion
    toast("📧 Enviando receta por correo al paciente...","info");
    try{
      const resp=await fetch(`${API_BASE}/reportes/receta/${id}/enviar`,{method:"POST"});
      if(resp.ok){
        toast("✅ Receta enviada por correo al paciente.");
      }else{
        const detalle=await resp.text();
        toast("❌ "+(detalle||"Error al enviar la receta."),"error");
      }
    }catch(e){
      toast("❌ Error de conexión: "+e.message,"error");
    }
    return;
  }
}
 
// ── Spinner CSS (inyectado dinámicamente) ────────────────
const style=document.createElement("style");
style.textContent=`
.spinner{width:20px;height:20px;border:3px solid #e5e7eb;border-top-color:var(--primary);border-radius:50%;animation:spin .7s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}
.stats-grid{grid-template-columns:repeat(4,minmax(0,1fr));}
@media(max-width:980px){.stats-grid{grid-template-columns:repeat(2,minmax(0,1fr));}}
`;
document.head.appendChild(style);
 
// ── ARRANQUE ─────────────────────────────────────────────
init();

// ══════════════════════════════════════════════════════════
//  SELECTOR DE USUARIO PARA FORMULARIO DE MÉDICO
// ══════════════════════════════════════════════════════════
function filtrarUsuariosDisponibles(texto){
  const dropdown=document.getElementById("usuario-dropdown");
  if(!dropdown) return;
  const t=texto.toLowerCase().trim();
  dropdown.style.display="block";
  dropdown.querySelectorAll(".usuario-option").forEach(opt=>{
    const label=opt.dataset.label.toLowerCase();
    opt.style.display=!t||label.includes(t)?"":"none";
  });
}

function seleccionarUsuario(el){
  const id=el.dataset.id;
  const label=el.dataset.label;

  // Guardar en el hidden input
  const hidden=document.getElementById("idUsuario-hidden");
  if(hidden) hidden.value=id;

  // Mostrar confirmación
  const box=document.getElementById("usuario-seleccionado");
  const lbl=document.getElementById("usuario-sel-label");
  if(box&&lbl){box.style.display="";lbl.textContent=label;}

  // Actualizar input de búsqueda y cerrar dropdown
  const input=document.getElementById("usuario-search-input");
  if(input) input.value=label;
  const dropdown=document.getElementById("usuario-dropdown");
  if(dropdown) dropdown.style.display="none";

  // ── Autocompletar datos del formulario ──────────────────
  // El backend serializa el campo como "usuario.idUsuario" en el JSON
  const paciente=state.db.pacientes.find(p=>{
    const uid=p.usuario?.idUsuario || p.usuarioId || p.id_usuario || null;
    return uid===id;
  });
  console.log(`✅ Seleccionado: ${id} → Paciente: ${paciente?.idPaciente} ${paciente?.nombre} ${paciente?.apellido} (usuario.idUsuario=${paciente?.usuario?.idUsuario})`);
  const usuario=state.db.usuarios.find(u=>u.idUsuario===id);
  const form=document.getElementById("medico-form");
  if(!form) return;

  if(paciente){
    // Separar nombre y apellido del paciente
    const nombreCompleto=(paciente.nombre||"").trim();
    const apellido=(paciente.apellido||"").trim();

    // Llenar campos
    const fNombre=form.querySelector("[name='nombre']");
    const fApellido=form.querySelector("[name='apellido']");
    const fTelefono=form.querySelector("[name='telefono']");
    const fFecha=form.querySelector("[name='fechaNacimiento']");
    const fSexo=form.querySelector("[name='sexo']");

    if(fNombre) fNombre.value = nombreCompleto;
    if(fApellido) fApellido.value = apellido;
    if(fTelefono) fTelefono.value = paciente.telefono || "";
    if(fSexo && paciente.sexo){
    fSexo.value =
    paciente.sexo === "M"
      ? "Masculino"
      : "Femenino";
}

if(fFecha && paciente.fechaNacimiento){
  const fecha = paciente.fechaNacimiento.split("T")[0];
  fFecha.value = fecha;
}

    // Resaltar campos autocompletados
    [fNombre,fApellido,fTelefono,fFecha].forEach(f=>{
      if(f&&f.value){
        f.style.background="#f0faf8";
        f.style.borderColor="#0f766e";
      }
    });

    toast(`✅ Datos de ${nombreCompleto} ${apellido} autocargados desde paciente.`);
  } else {
    // Si no tiene paciente, al menos mostrar el email como referencia
    toast(`ℹ️ Usuario seleccionado: ${usuario?.username||id}. Ingresa los datos del médico manualmente.`,"info");
  }
}

function limpiarUsuario(){
  const hidden=document.getElementById("idUsuario-hidden");
  if(hidden) hidden.value="";
  const box=document.getElementById("usuario-seleccionado");
  if(box) box.style.display="none";
  const input=document.getElementById("usuario-search-input");
  if(input){input.value="";input.focus();}
  const dropdown=document.getElementById("usuario-dropdown");
  if(dropdown) dropdown.style.display="block";
  // Limpiar resaltado de campos autocompletados
  const form=document.getElementById("medico-form");
  if(form){
    ["nombre","apellido","telefono","fechaNacimiento"].forEach(name=>{
      const f=form.querySelector(`[name='${name}']`);
      if(f){f.style.background="";f.style.borderColor="";}
    });
  }
}

// Cerrar dropdown al hacer clic fuera
document.addEventListener("click",e=>{
  if(!e.target.closest("#usuario-search-input")&&!e.target.closest("#usuario-dropdown")){
    const d=document.getElementById("usuario-dropdown");
    if(d) d.style.display="none";
  }
});
