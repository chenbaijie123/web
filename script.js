// ===== 数据存储 =====
const STORAGE_KEY = "my_phonebook_contacts";

function getContacts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveContacts(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// 头像配色
const colors = [
  "#4f6ef7",
  "#f76e4f",
  "#4ff7a8",
  "#a84ff7",
  "#f7c64f",
  "#4fc3f7",
  "#ef5350",
  "#66bb6a",
];
function colorFor(name) {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return colors[sum % colors.length];
}

// 获取首字母（简化：中文取第一个字，英文取首字母大写）
function getFirstLetter(name) {
  const ch = name.trim().charAt(0);
  if (/[a-zA-Z]/.test(ch)) return ch.toUpperCase();
  if (/[\u4e00-\u9fff]/.test(ch)) return "#"; // 中文统一归到 #
  return "#";
}

// ===== 渲染 =====
function render() {
  const keyword = document
    .getElementById("searchInput")
    .value.trim()
    .toLowerCase();
  let list = getContacts();

  if (keyword) {
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(keyword) ||
        c.phone.includes(keyword) ||
        (c.note && c.note.toLowerCase().includes(keyword))
    );
  }

  // 分组
  const groups = {};
  list.forEach((c) => {
    const letter = getFirstLetter(c.name);
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(c);
  });

  // 排序：字母在前，# 在后
  const sortedKeys = Object.keys(groups).sort((a, b) => {
    if (a === "#") return 1;
    if (b === "#") return -1;
    return a.localeCompare(b);
  });

  const container = document.getElementById("contactList");

  if (list.length === 0) {
    container.innerHTML = ` <div class="empty"> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"> <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/> </svg> <p>${ keyword ? "没有找到匹配的联系人" : "还没有联系人，点右上角添加" }</p> </div>`;
    document.getElementById("letterBar").innerHTML = "";
    return;
  }

  let html = "";
  sortedKeys.forEach((letter) => {
    html += `<div class="group">`;
    html += `<div class="group-title">${letter}</div>`;
    html += `<div class="contact-list">`;
    groups[letter].forEach((c) => {
      const initial = c.name.charAt(0);
      html += ` <div class="contact-item"> <div class="avatar" style="background:${colorFor( c.name )}">${initial}</div> <div class="contact-info"> <div class="contact-name">${escapeHtml(c.name)}</div> <div class="contact-phone">${escapeHtml(c.phone)}</div> ${ c.note ? `<div class="contact-note">${escapeHtml(c.note)}</div>` : "" } </div> <button class="delete-btn" onclick="deleteContact('${ c.id }')">删除</button> </div>`;
    });
    html += `</div></div>`;
  });

  container.innerHTML = html;

  // 字母索引条
  document.getElementById("letterBar").innerHTML = sortedKeys
    .map((k) => `<span>${k}</span>`)
    .join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ===== 添加 / 删除 =====
function openModal() {
  document.getElementById("inpName").value = "";
  document.getElementById("inpPhone").value = "";
  document.getElementById("inpNote").value = "";
  document.getElementById("modalMask").classList.add("show");
  setTimeout(() => document.getElementById("inpName").focus(), 200);
}

function closeModal() {
  document.getElementById("modalMask").classList.remove("show");
}

function saveContact() {
  const name = document.getElementById("inpName").value.trim();
  const phone = document.getElementById("inpPhone").value.trim();
  const note = document.getElementById("inpNote").value.trim();

  if (!name) {
    showToast("请输入姓名");
    return;
  }
  if (!phone) {
    showToast("请输入电话");
    return;
  }

  const list = getContacts();
  list.push({ id: Date.now().toString(), name, phone, note });
  saveContacts(list);
  closeModal();
  render();
  showToast("添加成功");
}

function deleteContact(id) {
  if (!confirm("确定删除这个联系人吗？")) return;
  let list = getContacts();
  list = list.filter((c) => c.id !== id);
  saveContacts(list);
  render();
  showToast("已删除");
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1500);
}

// 点击遮罩关闭弹窗
document.getElementById("modalMask").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeModal();
});

// 回车提交
document.getElementById("inpPhone").addEventListener("keydown", (e) => {
  if (e.key === "Enter") saveContact();
});

// 初始渲染
render();
