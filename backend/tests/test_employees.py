import uuid


def test_create_employee_valid(client, valid_employee_payload):
    response = client.post("/api/employees", json=valid_employee_payload)

    assert response.status_code == 201
    data = response.json()
    assert data["full_name"] == valid_employee_payload["full_name"]
    assert data["job_title"] == valid_employee_payload["job_title"]
    assert data["country"] == valid_employee_payload["country"]
    assert data["salary"] == valid_employee_payload["salary"]
    uuid.UUID(data["id"])


def test_create_employee_missing_required(client):
    response = client.post("/api/employees", json={"full_name": "Jane Doe"})

    assert response.status_code == 422


def test_list_employees_filter_by_country(client, valid_employee_payload):
    us_payload = valid_employee_payload
    in_payload = {**valid_employee_payload, "full_name": "Raj Patel", "country": "India", "currency": "INR", "salary": 1500000.0}

    client.post("/api/employees", json=us_payload)
    client.post("/api/employees", json=in_payload)

    response = client.get("/api/employees", params={"country": "India"})

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["country"] == "India"


def test_list_employees_pagination(client, valid_employee_payload):
    for i in range(5):
        payload = {**valid_employee_payload, "full_name": f"Employee {i}"}
        client.post("/api/employees", json=payload)

    response = client.get("/api/employees", params={"page": 1, "page_size": 2})

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 5
    assert len(data["items"]) == 2
    assert data["page"] == 1
    assert data["page_size"] == 2


def test_get_employee_by_id(client, valid_employee_payload):
    create_response = client.post("/api/employees", json=valid_employee_payload)
    employee_id = create_response.json()["id"]

    response = client.get(f"/api/employees/{employee_id}")

    assert response.status_code == 200
    assert response.json()["id"] == employee_id


def test_get_employee_not_found(client):
    response = client.get(f"/api/employees/{uuid.uuid4()}")

    assert response.status_code == 404


def test_update_employee(client, valid_employee_payload):
    create_response = client.post("/api/employees", json=valid_employee_payload)
    employee_id = create_response.json()["id"]

    response = client.put(
        f"/api/employees/{employee_id}",
        json={"full_name": "Jane Smith", "salary": 130000.0},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Jane Smith"
    assert data["salary"] == 130000.0


def test_delete_employee(client, valid_employee_payload):
    create_response = client.post("/api/employees", json=valid_employee_payload)
    employee_id = create_response.json()["id"]

    delete_response = client.delete(f"/api/employees/{employee_id}")
    assert delete_response.status_code == 204

    get_response = client.get(f"/api/employees/{employee_id}")
    assert get_response.status_code == 404
