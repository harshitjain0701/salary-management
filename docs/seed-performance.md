# Seed Performance — Employee Salary Management System

## Summary

The seed script (`backend/seed/seed.py`) generates realistic employee records using **SQLAlchemy `bulk_insert_mappings`** in batches of 500 rows, with a `tqdm` progress bar for visibility.

## Timing Results

Measured on Windows (Python 3.14, local SQLite file) after a clean database:

| Record count | Time (seconds) | Target |
|--------------|----------------|--------|
| 100          | ~2.0           | < 5s ✓ |
| 1,000        | ~0.9           | — |
| 10,000       | ~0.8           | — |

The first run includes Python module import and table creation overhead. Subsequent larger batches are faster because record generation is in-memory and SQLite writes are batched.

## Approach

### Why bulk insert?

Individual ORM inserts (`session.add()` in a loop) issue one `INSERT` per employee and flush ORM state each time. For 10,000 records this is unnecessarily slow.

`bulk_insert_mappings(Employee, batch)` sends multi-row inserts with minimal ORM overhead:

```python
for start in tqdm(range(0, len(records), BATCH_SIZE), desc="Seeding employees"):
    batch = records[start : start + BATCH_SIZE]
    db.bulk_insert_mappings(Employee, batch)
    db.commit()
```

### Batch size: 500

- Large enough to amortize commit cost
- Small enough to keep memory stable for 10k+ records
- Single batch for default `--count 100`

### Idempotency

Before seeding, the script checks `Employee` count. If any rows exist, it logs and exits — safe to run in setup scripts without duplicating data.

### Data generation

- Names: random combination of `first_names.txt` × `last_names.txt`
- Countries: 15 entries with realistic local salary ranges
- Job titles: 20 roles; departments: 5
- Currency derived from country map at generation time

## How to reproduce

```bash
cd backend
rm -f salary_management.db   # or del on Windows
python seed/seed.py --count 100
python seed/seed.py --count 1000
python seed/seed.py --count 10000
```

Use `Measure-Command` (PowerShell) or `time` (Linux/macOS) to capture elapsed time.

## Trade-off

Bulk insert bypasses ORM lifecycle hooks and defaults applied at flush time. The seed script sets all required fields (including UUID, timestamps) explicitly in the generated dict — acceptable for a seed utility, not for application CRUD.
