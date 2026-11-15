-- Asignación explícita de verificaciones a pasantes institucionales.
-- El rol técnico continúa siendo FUNCIONARIO; el área y esta asignación limitan el alcance.
ALTER TABLE verificacion
    ADD COLUMN asignado_a_id UUID REFERENCES usuario (id);

CREATE INDEX verificacion_asignado_a
    ON verificacion (asignado_a_id, expediente_id)
    WHERE asignado_a_id IS NOT NULL;
