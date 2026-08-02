# StudySpark Ansible Automation

This folder contains Ansible playbooks used to automate the StudySpark Docker application.

## Files

### inventory.ini
Defines the localhost inventory for Ansible.

### check-environment.yml
Checks whether Docker and Docker Compose are installed and available.

Run:

```bash
ansible-playbook -i inventory.ini check-environment.yml
```

---

### start-project.yml

Starts the StudySpark Docker containers.

Run:

```bash
ansible-playbook -i inventory.ini start-project.yml
```

---

### stop-project.yml

Stops all StudySpark Docker containers.

Run:

```bash
ansible-playbook -i inventory.ini stop-project.yml
```

---

### rebuild-project.yml

Stops containers, rebuilds Docker images without cache, and starts the application again.

Run:

```bash
ansible-playbook -i inventory.ini rebuild-project.yml
```

---

## Requirements

- Ubuntu (WSL)
- Docker Desktop
- Docker Compose
- Ansible

---

## Application URLs

Frontend:

```
http://localhost:5173
```

Backend:

```
http://localhost:5000
```
