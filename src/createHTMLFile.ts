import { writeFileSync } from "fs";
import path from "path";

export function createHTMLFile(machine: Record<string, any>) {

    if (machine.info.server && machine.info.ip) {
        const fileName = `${machine.info.tag || machine.info.ip}.html`;
        const redirectHtml = `
<!DOCTYPE html>
<html lang=\"pt-BR\">
<head>
<meta charset=\"UTF-8\">
<title>Redirecionando para Gestão Fácil</title>
<meta http-equiv=\"refresh\" content=\"0; url=http://${machine.info.ip}:8080/gestaofacil\" />
</head>
<body>
<p>Redirecionando para <a href=\"http://${machine.info.ip}:8080/gestaofacil\">Gestão Fácil</a>...</p>
</body>
</html>`;
        const folderPath = path.join(__dirname, 'public', (machine.info.tag || machine.info.name) as string);

        writeFileSync(path.join(folderPath, fileName), redirectHtml, { encoding: 'utf8' });
    }
};
