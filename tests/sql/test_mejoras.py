"""Prueba db/mejoras-despacho.sql contra PostgreSQL real, sobre una copia simulada de la base actual.
Uso: PGDSN="host=/tmp/pg port=5499 user=postgres" python3 tests/sql/test_mejoras.py"""
import os, sys, uuid, pathlib, psycopg
ROOT = pathlib.Path(__file__).resolve().parents[2]; DSN = os.environ.get('PGDSN', 'host=/tmp/pg port=5499 user=postgres'); DB = 'lmc_mejoras_test'
res = []
def check(n, ok, d=''): res.append(ok); print(('  OK    ' if ok else '  FALLA ') + n + ('' if ok else f'  ({d})'))
with psycopg.connect(DSN + ' dbname=postgres', autocommit=True) as c: c.execute(f'drop database if exists {DB}'); c.execute(f'create database {DB}')
conn = psycopg.connect(DSN + f' dbname={DB}', autocommit=True)
conn.execute((ROOT / 'tests/sql/base_actual_simulada.sql').read_text())
for _ in range(2): conn.execute((ROOT / 'db/mejoras-despacho.sql').read_text())
check('La mejora se instala y se puede repetir sin errores', True)
A, B, X, Z = (str(uuid.uuid4()) for _ in range(4))
conn.execute('insert into auth.users values (%s,%s),(%s,%s),(%s,%s),(%s,%s)', (A, 'a', B, 'b', X, 'x', Z, 'z'))
conn.execute("insert into public.professionals values (%s,'A',true),(%s,'B',true),(%s,'Inactivo',false)", (A, B, Z))
def run(uid, sql, params=(), role='authenticated'):
    with conn.transaction():
        conn.execute(f'set local role {role}'); conn.execute("select set_config('request.jwt.claims', %s, true)", ('{"sub":"%s"}' % uid if uid else '{}',))
        cur = conn.execute(sql, params); return cur.fetchall() if cur.description else cur.rowcount
def denied(uid, sql, params=(), role='authenticated'):
    try: run(uid, sql, params, role); return False
    except psycopg.Error: return True
case = run(A, "insert into cases(title,client_name,area,notes) values ('Caso','Cliente S.A.','Civil','nota') returning id")[0][0]
check('Crear expediente con cliente, materia y notas', run(B, 'select client_name from cases where id=%s', (case,))[0][0] == 'Cliente S.A.')
check('Editar cliente de un expediente', run(B, "update cases set client_name='Otro' where id=%s", (case,)) == 1)
ev = run(A, "insert into events(case_id,title,due_at) values (%s,'Plazo',now()) returning id", (case,))[0][0]
check('El otro profesional marca el plazo como hecho', run(B, 'update events set done=true where id=%s', (ev,)) == 1)
check('Se registra la fecha en que se marcó', run(A, 'select done_at is not null from events where id=%s', (ev,))[0][0])
check('No se puede cambiar el título del plazo (solo "hecho")', denied(A, "update events set title='x' where id=%s", (ev,)))
check('Cuenta sin alta no puede marcar plazos', run(X, 'update events set done=false where id=%s', (ev,)) == 0)
check('Profesional inactivo no puede marcar plazos', run(Z, 'update events set done=false where id=%s', (ev,)) == 0)
run(A, "insert into quotes(client_name,service,tariff_id,total,detail,case_id) values ('Cliente','Compraventa','not-cv',1953008,'{}',%s)", (case,))
check('Cotización guardada y visible para el otro profesional', run(B, 'select count(*) from quotes')[0][0] == 1)
check('Cuenta sin alta no ve cotizaciones', run(X, 'select count(*) from quotes')[0][0] == 0)
check('Visitante sin sesión no ve cotizaciones', denied(None, 'select * from quotes', role='anon'))
check('Cuenta sin alta no puede crear cotizaciones', denied(X, "insert into quotes(client_name,service,tariff_id,total) values ('x','x','x',1)"))
check('No se puede crear a nombre de otro profesional', denied(A, "insert into quotes(client_name,service,tariff_id,total,created_by) values ('x','x','x',1,%s)", (B,)))
check('Las cotizaciones no se pueden editar', denied(A, 'update quotes set total=1'))
check('Las cotizaciones no se pueden borrar', denied(A, 'delete from quotes'))
check('Se mantiene: no se puede cambiar el autor del expediente', denied(B, 'update cases set created_by=%s where id=%s', (B, case)))
conn.close()
with psycopg.connect(DSN + ' dbname=postgres', autocommit=True) as c: c.execute(f'drop database if exists {DB}')
print(f'\n{sum(res)}/{len(res)} pruebas de base de datos superadas'); sys.exit(0 if all(res) else 1)
