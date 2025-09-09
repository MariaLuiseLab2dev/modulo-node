const apiTarefas = 'http://localhost:3000/tarefas';
const apiUsuarios = 'http://localhost:3000/usuarios';

// Alternar entre seções
function mostrarSecao(secao) {
     // pega a div de tarefas e decide se mostra ou esconde
    document.getElementById('tarefas').style.display = (secao === 'tarefas') ? 'block' : 'none';
    document.getElementById('usuarios').style.display = (secao === 'usuarios') ? 'block' : 'none';
}

//
// -------- CRUD TAREFAS --------
//
async function listarTarefas() {
    const res = await fetch(apiTarefas);
    const tarefas = await res.json();
    const container = document.getElementById('tasks');
    container.innerHTML = '';
    tarefas.forEach(t => {
        const div = document.createElement('div');
        div.textContent = `ID: ${t.id} | Título: ${t.titulo} | Descrição: ${t.descricao}`;
        container.appendChild(div);
    });
}

document.getElementById('btnCreate').addEventListener('click', async () => {
    const titulo = document.getElementById('titulo').value;
    const descricao = document.getElementById('descricao').value;
    const response = await fetch(apiTarefas, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, descricao })
    });
    
    const data = await response.json();

    if (!response.ok) {
        alert(data.error);
        return;
    }

    alert(data.message);
    listarTarefas();
});

document.getElementById('btnUpdate').addEventListener('click', async () => {
    const id = document.getElementById('updateId').value;
    const titulo = document.getElementById('updateTitulo').value;
    const descricao = document.getElementById('updateDescricao').value;
    const response = await fetch(`${apiTarefas}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, descricao })
    });

    const data = await response.json();
    if (!response.ok) {
        alert(data.error);
        return;
    }

    alert(data.message);
    listarTarefas();
});

document.getElementById('btnDelete').addEventListener('click', async () => {
    const id = document.getElementById('deleteId').value;

    if (!id) {
        alert('Informe um ID válido');
        return;
    }

    const response = await fetch(`${apiTarefas}/${id}`, { method: 'DELETE' });
    
    const data = await response.json();

    if (!response.ok) {
        alert(data.error); // mostra "Tarefa X não encontrada"
        return;
    }

    alert(data.message);
    listarTarefas();
});


//
// -------- CRUD USUÁRIOS --------
//
async function listarUsuarios() {
  const res = await fetch(apiUsuarios);
  const data = await res.json();   // <- é um objeto
  const usuarios = data.usuarios;  // <- aqui sim o array
  const container = document.getElementById('users');
  container.innerHTML = '';

  usuarios.forEach(u => {
    const div = document.createElement('div');
    div.textContent = `ID: ${u.id} | Nome: ${u.nome} | Email: ${u.email}`;
    container.appendChild(div);
  });
}

document.getElementById('btnCreateUser').addEventListener('click', async () => {
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const response = await fetch(apiUsuarios, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
    });
    
    const data = await response.json();
    if (!response.ok) {
        alert(data.error); // mostra "Tarefa X não encontrada"
        return;
    }
    listarUsuarios();
});

document.getElementById('btnUpdateUser').addEventListener('click', async () => {
    const id = document.getElementById('updateUserId').value;
    const nome = document.getElementById('updateNome').value;
    const email = document.getElementById('updateEmail').value;
    const senha = document.getElementById('updateSenha').value;
    const response = await fetch(`${apiUsuarios}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.error);
        return;
    }

    alert(data.message);
    listarUsuarios();
});

document.getElementById('btnDeleteUser').addEventListener('click', async () => {
    const id = document.getElementById('deleteUserId').value;
    const response = await fetch(`${apiUsuarios}/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) {
        alert(data.error);
        return;
    }

    alert(data.message);
    listarUsuarios();
});

// Carregar listas iniciais
listarTarefas();
listarUsuarios();
