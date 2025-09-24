import { writeFileSync } from "fs";
import path from "path";

export function createHTMLFile(machine: Record<string, any>) {

    if (machine.isServer && machine.ip) {
        const fileName = `${machine.group.name || machine.name || machine.ip}.html`;
        const redirectHtml = `
<!DOCTYPE html>
<html lang=\"pt-BR\">
<head>
<meta charset=\"UTF-8\">
<title>Redirecionando para Gestão Fácil</title>
<meta http-equiv=\"refresh\" content=\"0; url=http://${machine.ip}:8080/gestaofacil\" />
</head>
<body>
<p>Redirecionando para <a href=\"http://${machine.ip}:8080/gestaofacil\">Gestão Fácil</a>...</p>
</body>
</html>`;
        const folderPath = path.join(__dirname, '..', 'public', (machine.group) as string);

        writeFileSync(path.join(folderPath, fileName), redirectHtml, { encoding: 'utf8' });
    }
};
