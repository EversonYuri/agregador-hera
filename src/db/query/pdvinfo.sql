SELECT
	JSON_OBJECT(
		'TIPO_APLICATIVO', ec2.TIPO_APLICATIVO,
		'NOME', ec.NOME,
		'versao', ec2.versao,
		'SERIE_NFCE', ec2.SERIE_NFCE,
		'SERVIDOR_NFCE',
			CASE
				WHEN ec2.SERVIDOR_NFCE = 2 THEN 'NS A1'
				WHEN ec2.SERVIDOR_NFCE = 3 THEN 'NS A3'
				WHEN ec2.SERVIDOR_NFCE = 4 THEN 'EMISSOR HERA'
				ELSE NULL
			END
	) AS pdvInfo,
	(
		SELECT
			CONCAT(
				'[', 
				IFNULL(
					GROUP_CONCAT(
						JSON_OBJECT(
							'id', v.id,
							'NUMERO_NFCE', v.NUMERO_NFCE,
							'STATUS_NFCE', v.STATUS_NFCE,
							'RETORNO_NFCE', v.RETORNO_NFCE
						)
						SEPARATOR ','
					),
				''
				),
				']'
			)
		FROM pdv.ecf_venda_cabecalho v
		WHERE INSTR(CONVERT(v.RETORNO_NFCE USING cp850), 'Duplicidade de NF-e') > 0
	) AS notasDuplicidade,
	(
		SELECT
			CONCAT(
				'[', 
				IFNULL(
					GROUP_CONCAT(
						JSON_OBJECT(
							'GTIN', d.GTIN,
							'DESCRICAO', d.DESCRICAO
						)
						SEPARATOR ','
					),
				''
				),
				']'
			)
		FROM pdv.ecf_venda_detalhe d
		JOIN pdv.ecf_venda_cabecalho c ON d.ID_ECF_VENDA_CABECALHO = c.ID
		WHERE
			INSTR(CONVERT(c.RETORNO_NFCE USING latin1), 'Rejeição: Informado NCM inexistente [nItem:') > 0
			AND d.ITEM = SUBSTRING(
				CONVERT(c.RETORNO_NFCE USING latin1),
				INSTR(CONVERT(c.RETORNO_NFCE USING latin1), '[nItem:') + 7,
				INSTR(CONVERT(c.RETORNO_NFCE USING latin1), ']') - INSTR(CONVERT(c.RETORNO_NFCE USING latin1), '[nItem:') - 7
			)
	) AS NCMIncorretos,
	(
		SELECT
			CONCAT(
				'[', 
				IFNULL(
					GROUP_CONCAT(
						JSON_OBJECT(
							'id', v2.id,
							'NUMERO_NFCE', v2.NUMERO_NFCE,
							'STATUS_NFCE', v2.STATUS_NFCE,
							'RETORNO_NFCE', v2.RETORNO_NFCE
						)
						SEPARATOR ','
					),
				''
				),
				']'
			)
		FROM pdv.ecf_venda_cabecalho v2
		WHERE v2.STATUS_NFCE = 2
	) AS notasRejeitadas

FROM
	pdv.ecf_configuracao ec2
JOIN pdv.ecf_caixa ec;
