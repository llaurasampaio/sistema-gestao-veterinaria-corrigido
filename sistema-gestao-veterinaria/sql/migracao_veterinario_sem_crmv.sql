USE sistema_veterinario;

ALTER TABLE veterinarios
  MODIFY crmv VARCHAR(40) NULL;

INSERT INTO veterinarios (usuario_id, crmv)
SELECT u.id, NULL
FROM usuarios u
WHERE u.perfil = 'veterinario'
  AND NOT EXISTS (
    SELECT 1
    FROM veterinarios v
    WHERE v.usuario_id = u.id
  );
