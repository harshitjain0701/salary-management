def _create_employee(client, payload):
    return client.post("/api/employees", json=payload).json()


def test_country_insights_min_max_avg(client, valid_employee_payload):
    _create_employee(client, {**valid_employee_payload, "full_name": "Alice", "salary": 80000.0})
    _create_employee(client, {**valid_employee_payload, "full_name": "Bob", "salary": 120000.0})
    _create_employee(client, {**valid_employee_payload, "full_name": "Carol", "salary": 100000.0})

    response = client.get("/api/insights/country/United States")

    assert response.status_code == 200
    data = response.json()
    assert data["country"] == "United States"
    assert data["headcount"] == 3
    assert data["min_salary"] == 80000.0
    assert data["max_salary"] == 120000.0
    assert data["avg_salary"] == 100000.0


def test_country_insights_top_job_titles(client, valid_employee_payload):
    _create_employee(client, {**valid_employee_payload, "full_name": "Eng 1", "job_title": "Software Engineer"})
    _create_employee(client, {**valid_employee_payload, "full_name": "Eng 2", "job_title": "Software Engineer"})
    _create_employee(client, {**valid_employee_payload, "full_name": "PM 1", "job_title": "Product Manager"})

    response = client.get("/api/insights/country/United States")

    assert response.status_code == 200
    top_titles = response.json()["top_job_titles"]
    assert top_titles[0]["job_title"] == "Software Engineer"
    assert top_titles[0]["headcount"] == 2


def test_job_title_insights_by_country(client, valid_employee_payload):
    _create_employee(client, {**valid_employee_payload, "full_name": "US Eng", "salary": 100000.0})
    _create_employee(
        client,
        {
            **valid_employee_payload,
            "full_name": "IN Eng",
            "country": "India",
            "currency": "INR",
            "salary": 2000000.0,
        },
    )

    response = client.get("/api/insights/job-title", params={"country": "United States"})

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["job_title"] == "Software Engineer"
    assert data[0]["avg_salary"] == 100000.0


def test_org_summary(client, valid_employee_payload):
    _create_employee(client, valid_employee_payload)
    _create_employee(
        client,
        {
            **valid_employee_payload,
            "full_name": "Raj Patel",
            "country": "India",
            "currency": "INR",
            "salary": 1500000.0,
        },
    )

    response = client.get("/api/insights/summary")

    assert response.status_code == 200
    data = response.json()
    assert data["total_headcount"] == 2
    assert data["country_count"] == 2
    assert len(data["country_breakdown"]) == 2


def test_distinct_countries(client, valid_employee_payload):
    _create_employee(client, valid_employee_payload)
    _create_employee(
        client,
        {
            **valid_employee_payload,
            "full_name": "Raj Patel",
            "country": "India",
            "currency": "INR",
            "salary": 1500000.0,
        },
    )

    response = client.get("/api/countries")

    assert response.status_code == 200
    countries = response.json()
    assert "United States" in countries
    assert "India" in countries


def test_distinct_job_titles(client, valid_employee_payload):
    _create_employee(client, valid_employee_payload)
    _create_employee(
        client,
        {**valid_employee_payload, "full_name": "PM User", "job_title": "Product Manager"},
    )

    response = client.get("/api/job-titles")

    assert response.status_code == 200
    titles = response.json()
    assert "Software Engineer" in titles
    assert "Product Manager" in titles
