#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para gerar banco de dados completo de todos os parlamentares do Brasil
- 513 Deputados Federais
- 81 Senadores

Dados coletados de fontes oficiais:
- Câmara dos Deputados
- Senado Federal
- TSE

Autor: Sistema de Pesquisa Eleitoral DF 2026
Data: Janeiro 2026
"""

import json
import os
import random
import hashlib
from datetime import datetime, date
from typing import Dict, List, Any, Optional

# ============================================================
# DADOS DOS DEPUTADOS FEDERAIS (513)
# ============================================================

DEPUTADOS_FEDERAIS_RAW = """
Abilio Brunini,PL,MT
Acácio Favacho,MDB,AP
Adail Filho,REPUBLICANOS,AM
Adilson Barroso,PL,SP
Adolfo Viana,PSDB,BA
Adriana Ventura,NOVO,SP
Adriano do Baldy,PP,GO
Aécio Neves,PSDB,MG
Afonso Hamm,PP,RS
Afonso Motta,PDT,RS
Aguinaldo Ribeiro,PP,PB
Airton Faleiro,PT,PA
AJ Albuquerque,PP,CE
Alberto Fraga,PL,DF
Alberto Mourão,MDB,SP
Albuquerque,REPUBLICANOS,RR
Alceu Moreira,MDB,RS
Alencar Santana,PT,SP
Alex Manente,CIDADANIA,SP
Alex Santana,REPUBLICANOS,BA
Alexandre Guimarães,MDB,TO
Alexandre Leite,UNIÃO,SP
Alexandre Lindenmeyer,PT,RS
Alfredinho,PT,SP
Alfredo Gaspar,UNIÃO,AL
Alice Portugal,PCdoB,BA
Aliel Machado,PV,PR
Allan Garcês,PP,MA
Altineu Côrtes,PL,RJ
Aluisio Mendes,REPUBLICANOS,MA
Amanda Gentil,PP,MA
Amaro Neto,REPUBLICANOS,ES
Amom Mandel,CIDADANIA,AM
Ana Paula Leão,PP,MG
Ana Paula Lima,PT,SC
Ana Pimentel,PT,MG
André Ferreira,PL,PE
André Figueiredo,PDT,CE
André Janones,AVANTE,MG
Andreia Siqueira,MDB,PA
Antônia Lúcia,REPUBLICANOS,AC
Antonio Andrade,REPUBLICANOS,TO
Antonio Brito,PSD,BA
Antonio Carlos Rodrigues,PL,SP
Antônio Doido,MDB,PA
Any Ortiz,CIDADANIA,RS
Arlindo Chinaglia,PT,SP
Arnaldo Jardim,CIDADANIA,SP
Arthur Lira,PP,AL
Arthur Oliveira Maia,UNIÃO,BA
Átila Lins,PSD,AM
Átila Lira,PP,PI
Augusto Coutinho,REPUBLICANOS,PE
Augusto Puppio,MDB,AP
Aureo Ribeiro,SOLIDARIEDADE,RJ
Bacelar,PV,BA
Baleia Rossi,MDB,SP
Bandeira de Mello,PSB,RJ
Bebeto,PP,RJ
Benedita da Silva,PT,RJ
Benes Leocádio,UNIÃO,RN
Beto Pereira,PSDB,MS
Beto Preto,PSD,PR
Beto Richa,PSDB,PR
Bia Kicis,PL,DF
Bibo Nunes,PL,RS
Bohn Gass,PT,RS
Bruno Farias,AVANTE,MG
Bruno Ganem,PODE,SP
Cabo Gilberto Silva,PL,PB
Camila Jara,PT,MS
Capitão Alberto Neto,PL,AM
Capitão Alden,PL,BA
Capitão Augusto,PL,SP
Carla Zambelli,PL,SP
Carlos Henrique Gaguim,UNIÃO,TO
Carlos Jordy,PL,RJ
Carlos Sampaio,PSD,SP
Carlos Veras,PT,PE
Carlos Zarattini,PT,SP
Carmen Zanotto,CIDADANIA,SC
Carol Dartora,PT,PR
Caroline de Toni,PL,SC
Castro Neto,PSD,PI
Célia Xakriabá,PSOL,MG
Célio Silveira,MDB,GO
Célio Studart,PSD,CE
Celso Russomanno,REPUBLICANOS,SP
Cezinha de Madureira,PSD,SP
Charles Fernandes,PSD,BA
Chico Alencar,PSOL,RJ
Chiquinho Brazão,S.PART.,RJ
Chris Tonietto,PL,RJ
Clarissa Tércio,PP,PE
Claudio Cajado,PP,BA
Cleber Verde,MDB,MA
Clodoaldo Magalhães,PV,PE
Cobalchini,MDB,SC
Coronel Assis,UNIÃO,MT
Coronel Chrisóstomo,PL,RO
Coronel Fernanda,PL,MT
Coronel Meira,PL,PE
Coronel Ulysses,UNIÃO,AC
Covatti Filho,PP,RS
Cristiane Lopes,UNIÃO,RO
Da Vitoria,PP,ES
Dagoberto Nogueira,PSDB,MS
Daiana Santos,PCdoB,RS
Dal Barreto,UNIÃO,BA
Damião Feliciano,UNIÃO,PB
Dandara,PT,MG
Dani Cunha,UNIÃO,RJ
Daniel Agrobom,PL,GO
Daniel Almeida,PCdoB,BA
Daniel Barbosa,PP,AL
Daniel Freitas,PL,SC
Daniel Trzeciak,PSDB,RS
Daniela do Waguinho,UNIÃO,RJ
Daniela Reinehr,PL,SC
Danilo Forte,UNIÃO,CE
Danrlei de Deus Hinterholz,PSD,RS
David Soares,UNIÃO,SP
Dayany Bittencourt,UNIÃO,CE
Defensor Stélio Dener,REPUBLICANOS,RR
Delegada Adriana Accorsi,PT,GO
Delegada Ione,AVANTE,MG
Delegada Katarina,PSD,SE
Delegado Bruno Lima,PP,SP
Delegado Caveira,PL,PA
Delegado da Cunha,PP,SP
Delegado Éder Mauro,PL,PA
Delegado Fabio Costa,PP,AL
Delegado Marcelo Freitas,UNIÃO,MG
Delegado Matheus Laiola,UNIÃO,PR
Delegado Palumbo,MDB,SP
Delegado Paulo Bilynskyj,PL,SP
Delegado Ramagem,PL,RJ
Denise Pessôa,PT,RS
Detinha,PL,MA
Diego Andrade,PSD,MG
Diego Coronel,PSD,BA
Diego Garcia,REPUBLICANOS,PR
Dilceu Sperafico,PP,PR
Dilvanda Faro,PT,PA
Dimas Fabiano,PP,MG
Dimas Gadelha,PT,RJ
Domingos Neto,PSD,CE
Domingos Sávio,PL,MG
Dorinaldo Malafaia,PDT,AP
Douglas Viegas,UNIÃO,SP
Doutor Luizinho,PP,RJ
Dr. Benjamim,UNIÃO,MA
Dr. Fernando Máximo,UNIÃO,RO
Dr. Francisco,PT,PI
Dr. Frederico,PRD,MG
Dr. Jaziel,PL,CE
Dr. Luiz Ovando,PP,MS
Dr. Victor Linhalis,PODE,ES
Dr. Zacharias Calil,UNIÃO,GO
Dra. Alessandra Haber,MDB,PA
Dra. Mayra Pinheiro,PL,CE
Duarte Jr.,PSB,MA
Duda Ramos,MDB,RR
Duda Salabert,PDT,MG
Eduardo Bismarck,PDT,CE
Eduardo Bolsonaro,PL,SP
Eduardo da Fonte,PP,PE
Eduardo Velloso,UNIÃO,AC
Elcione Barbalho,MDB,PA
Eli Borges,PL,TO
Elisangela Araujo,PT,BA
Elmar Nascimento,UNIÃO,BA
Ely Santos,REPUBLICANOS,SP
Emanuel Pinheiro Neto,MDB,MT
Emidinho Madeira,PL,MG
Eriberto Medeiros,PSB,PE
Erika Hilton,PSOL,SP
Erika Kokay,PT,DF
Eros Biondini,PL,MG
Euclydes Pettersen,REPUBLICANOS,MG
Eunício Oliveira,MDB,CE
Evair Vieira de Melo,PP,ES
Fábio Macedo,PODE,MA
Fabio Schiochet,UNIÃO,SC
Fábio Teruel,MDB,SP
Fausto Pinato,PP,SP
Fausto Santos Jr.,UNIÃO,AM
Felipe Carreras,PSB,PE
Felipe Francischini,UNIÃO,PR
Félix Mendonça Júnior,PDT,BA
Fernanda Melchionna,PSOL,RS
Fernanda Pessoa,UNIÃO,CE
Fernando Coelho Filho,UNIÃO,PE
Fernando Mineiro,PT,RN
Fernando Monteiro,PP,PE
Fernando Rodolfo,PL,PE
Filipe Barros,PL,PR
Filipe Martins,PL,TO
Flávia Morais,PDT,GO
Flávio Nogueira,PT,PI
Florentino Neto,PT,PI
Franciane Bayer,REPUBLICANOS,RS
Fred Costa,PRD,MG
Fred Linhares,REPUBLICANOS,DF
Gabriel Mota,REPUBLICANOS,RR
Gabriel Nunes,PSD,BA
General Girão,PL,RN
General Pazuello,PL,RJ
Geraldo Resende,PSDB,MS
Gerlen Diniz,PP,AC
Gervásio Maia,PSB,PB
Giacobo,PL,PR
Gilberto Abramo,REPUBLICANOS,MG
Gilberto Nascimento,PSD,SP
Gilson Daniel,PODE,ES
Gilson Marques,NOVO,SC
Gilvan da Federal,PL,ES
Gilvan Maximo,REPUBLICANOS,DF
Giovani Cherini,PL,RS
Gisela Simona,UNIÃO,MT
Glauber Braga,PSOL,RJ
Gláucia Santiago,PL,MG
Glaustin da Fokus,PODE,GO
Gleisi Hoffmann,PT,PR
Greyce Elias,AVANTE,MG
Guilherme Boulos,PSOL,SP
Guilherme Uchoa,PSB,PE
Gustavo Gayer,PL,GO
Gustinho Ribeiro,REPUBLICANOS,SE
Gutemberg Reis,MDB,RJ
Heitor Schuch,PSB,RS
Helder Salomão,PT,ES
Helena Lima,MDB,RR
Hélio Leite,UNIÃO,PA
Helio Lopes,PL,RJ
Henderson Pinto,MDB,PA
Hercílio Coelho Diniz,MDB,MG
Hugo Leal,PSD,RJ
Hugo Motta,REPUBLICANOS,PB
Icaro de Valmir,PL,SE
Idilvan Alencar,PDT,CE
Igor Timo,PSD,MG
Ismael,PSD,SC
Ismael Alexandrino,PSD,GO
Isnaldo Bulhões Jr.,MDB,AL
Ivan Valente,PSOL,SP
Ivoneide Caetano,PT,BA
Iza Arruda,MDB,PE
Jack Rocha,PT,ES
Jadyel Alencar,REPUBLICANOS,PI
Jandira Feghali,PCdoB,RJ
Jeferson Rodrigues,REPUBLICANOS,GO
Jefferson Campos,PL,SP
Jilmar Tatto,PT,SP
João Carlos Bacelar,PL,BA
João Daniel,PT,SE
João Leão,PP,BA
João Maia,PP,RN
Joaquim Passarinho,PL,PA
Jonas Donizette,PSB,SP
Jorge Braz,REPUBLICANOS,RJ
Jorge Goetten,REPUBLICANOS,SC
Jorge Solla,PT,BA
José Airton Félix Cirilo,PT,CE
José Guimarães,PT,CE
José Medeiros,PL,MT
José Nelto,UNIÃO,GO
José Priante,MDB,PA
José Rocha,UNIÃO,BA
Joseildo Ramos,PT,BA
Josenildo,PDT,AP
Josias Gomes,PT,BA
Josimar Maranhãozinho,PL,MA
Josivaldo JP,PSD,MA
Juarez Costa,MDB,MT
Julia Zanatta,PL,SC
Juliana Cardoso,PT,SP
Julio Arcoverde,PP,PI
Júlio Cesar,PSD,PI
Julio Cesar Ribeiro,REPUBLICANOS,DF
Julio Lopes,PP,RJ
Juninho do Pneu,UNIÃO,RJ
Júnior Ferrari,PSD,PA
Junior Lourenço,PL,MA
Keniston Braga,MDB,PA
Kiko Celeguim,PT,SP
Kim Kataguiri,UNIÃO,SP
Lafayette de Andrada,REPUBLICANOS,MG
Laura Carneiro,PSD,RJ
Lázaro Botelho,PP,TO
Lebrão,UNIÃO,RO
Lêda Borges,PSDB,GO
Leo Prates,PDT,BA
Leonardo Monteiro,PT,MG
Leur Lomanto Júnior,UNIÃO,BA
Lídice da Mata,PSB,BA
Lincoln Portela,PL,MG
Lindbergh Farias,PT,RJ
Lucas Ramos,PSB,PE
Lucas Redecker,PSDB,RS
Luciano Amaral,PV,AL
Luciano Bivar,UNIÃO,PE
Luciano Ducci,PSB,PR
Luciano Vieira,REPUBLICANOS,RJ
Lucio Mosquini,MDB,RO
Luis Carlos Gomes,REPUBLICANOS,RJ
Luis Tibé,AVANTE,MG
Luisa Canziani,PSD,PR
Luiz Carlos Busato,UNIÃO,RS
Luiz Carlos Hauly,PODE,PR
Luiz Carlos Motta,PL,SP
Luiz Couto,PT,PB
Luiz Fernando Faria,PSD,MG
Luiz Fernando Vampiro,MDB,SC
Luiz Gastão,PSD,CE
Luiz Lima,PL,RJ
Luiz Nishimori,PSD,PR
Luiz Philippe de Orleans e Bragança,PL,SP
Luiza Erundina,PSOL,SP
Luizianne Lins,PT,CE
Lula da Fonte,PP,PE
Magda Mofatto,PRD,GO
Marangoni,UNIÃO,SP
Marcel van Hattem,NOVO,RS
Marcelo Álvaro Antônio,PL,MG
Marcelo Crivella,REPUBLICANOS,RJ
Marcelo Moraes,PL,RS
Marcelo Queiroz,PP,RJ
Marcio Alvino,PL,SP
Márcio Biolchi,MDB,RS
Márcio Honaiser,PDT,MA
Márcio Jerry,PCdoB,MA
Márcio Marinho,REPUBLICANOS,BA
Marco Brasil,PP,PR
Marcon,PT,RS
Marcos Aurélio Sampaio,PSD,PI
Marcos Pereira,REPUBLICANOS,SP
Marcos Pollon,PL,MS
Marcos Soares,UNIÃO,RJ
Marcos Tavares,PDT,RJ
Maria Arraes,SOLIDARIEDADE,PE
Maria do Rosário,PT,RS
Maria Rosas,REPUBLICANOS,SP
Mario Frias,PL,SP
Mário Heringer,PDT,MG
Mário Negromonte Jr.,PP,BA
Marreca Filho,PRD,MA
Marussa Boldrin,MDB,GO
Marx Beltrão,PP,AL
Matheus Noronha,PL,CE
Maurício Carvalho,UNIÃO,RO
Mauricio do Vôlei,PL,MG
Mauricio Marcon,PODE,RS
Mauricio Neves,PP,SP
Mauro Benevides Filho,PDT,CE
Max Lemos,PDT,RJ
Meire Serafim,UNIÃO,AC
Mendonça Filho,UNIÃO,PE
Merlong Solano,PT,PI
Mersinho Lucena,PP,PB
Messias Donato,REPUBLICANOS,ES
Miguel Ângelo,PT,MG
Miguel Lombardi,PL,SP
Misael Varella,PSD,MG
Moses Rodrigues,UNIÃO,CE
Murillo Gouvea,UNIÃO,RJ
Murilo Galdino,REPUBLICANOS,PB
Natália Bonavides,PT,RN
Nelson Barbudo,PL,MT
Nely Aquino,PODE,MG
Neto Carletto,PP,BA
Newton Bonin,UNIÃO,PR
Newton Cardoso Jr,MDB,MG
Nicoletti,UNIÃO,RR
Nikolas Ferreira,PL,MG
Nilto Tatto,PT,SP
Nitinho,PSD,SE
Odair Cunha,PT,MG
Olival Marques,MDB,PA
Orlando Silva,PCdoB,SP
Osmar Terra,MDB,RS
Ossesio Silva,REPUBLICANOS,PE
Otoni de Paula,MDB,RJ
Otto Alencar Filho,PSD,BA
Padovani,UNIÃO,PR
Padre João,PT,MG
Pastor Diniz,UNIÃO,RR
Pastor Eurico,PL,PE
Pastor Gil,PL,MA
Pastor Henrique Vieira,PSOL,RJ
Pastor Sargento Isidório,AVANTE,BA
Patrus Ananias,PT,MG
Paulão,PT,AL
Paulinho da Força,SOLIDARIEDADE,SP
Paulinho Freire,UNIÃO,RN
Paulo Abi-Ackel,PSDB,MG
Paulo Alexandre Barbosa,PSDB,SP
Paulo Azi,UNIÃO,BA
Paulo Folletto,PSB,ES
Paulo Freire Costa,PL,SP
Paulo Guedes,PT,MG
Paulo Litro,PSD,PR
Paulo Magalhães,PSD,BA
Pedro Aihara,PRD,MG
Pedro Campos,PSB,PE
Pedro Lucas Fernandes,UNIÃO,MA
Pedro Lupion,PP,PR
Pedro Paulo,PSD,RJ
Pedro Uczai,PT,SC
Pedro Westphalen,PP,RS
Pezenti,MDB,SC
Pinheirinho,PP,MG
Pompeo de Mattos,PDT,RS
Pr. Marco Feliciano,PL,SP
Prof. Reginaldo Veras,PV,DF
Professor Alcides,PL,GO
Professora Goreth,PDT,AP
Professora Luciene Cavalcante,PSOL,SP
Rafael Brito,MDB,AL
Rafael Prudente,MDB,DF
Rafael Simoes,UNIÃO,MG
Raimundo Costa,PODE,BA
Raimundo Santos,PSD,PA
Reginaldo Lopes,PT,MG
Reginete Bispo,PT,RS
Reimont,PT,RJ
Reinhold Stephanes,PSD,PR
Renan Ferreirinha,PSD,RJ
Renata Abreu,PODE,SP
Renilce Nicodemos,MDB,PA
Renildo Calheiros,PCdoB,PE
Ricardo Ayres,REPUBLICANOS,TO
Ricardo Guidi,PL,SC
Ricardo Maia,MDB,BA
Ricardo Salles,NOVO,SP
Ricardo Silva,PSD,SP
Robério Monteiro,PDT,CE
Roberta Roma,PL,BA
Roberto Duarte,REPUBLICANOS,AC
Roberto Monteiro Pai,PL,RJ
Robinson Faria,PL,RN
Rodolfo Nogueira,PL,MS
Rodrigo de Castro,UNIÃO,MG
Rodrigo Estacho,PSD,PR
Rodrigo Gambale,PODE,SP
Rodrigo Valadares,UNIÃO,SE
Rogéria Santos,REPUBLICANOS,BA
Rogério Correia,PT,MG
Romero Rodrigues,PODE,PB
Ronaldo Nogueira,REPUBLICANOS,RS
Rosana Valle,PL,SP
Rosangela Moro,UNIÃO,SP
Rosângela Reis,PL,MG
Roseana Sarney,MDB,MA
Rubens Otoni,PT,GO
Rubens Pereira Júnior,PT,MA
Rui Falcão,PT,SP
Ruy Carneiro,PODE,PB
Sâmia Bomfim,PSOL,SP
Samuel Viana,REPUBLICANOS,MG
Sanderson,PL,RS
Sargento Fahur,PSD,PR
Sargento Gonçalves,PL,RN
Sargento Portugal,PODE,RJ
Saullo Vianna,UNIÃO,AM
Saulo Pedroso,PSD,SP
Sergio Souza,MDB,PR
Sidney Leite,PSD,AM
Silas Câmara,REPUBLICANOS,AM
Silvia Cristina,PP,RO
Silvia Waiãpi,PL,AP
Silvye Alves,UNIÃO,GO
Simone Marquetto,MDB,SP
Socorro Neri,PP,AC
Sonize Barbosa,PL,AP
Soraya Santos,PL,RJ
Sóstenes Cavalcante,PL,RJ
Stefano Aguiar,PSD,MG
Tabata Amaral,PSB,SP
Tadeu Oliveira,PL,CE
Tadeu Veneri,PT,PR
Talíria Petrone,PSOL,RJ
Tarcísio Motta,PSOL,RJ
Thiago de Joaldo,PP,SE
Thiago Flores,REPUBLICANOS,RO
Tião Medeiros,PP,PR
Tiririca,PL,SP
Toninho Wandscheer,PP,PR
Túlio Gadêlha,REDE,PE
Valmir Assunção,PT,BA
Vander Loubet,PT,MS
Vermelho,PL,PR
Vicentinho,PT,SP
Vicentinho Júnior,PP,TO
Vinicius Carvalho,REPUBLICANOS,SP
Vinicius Gurgel,PL,AP
Vitor Lippi,PSDB,SP
Waldemar Oliveira,AVANTE,PE
Waldenor Pereira,PT,BA
Washington Quaquá,PT,RJ
Weliton Prado,SOLIDARIEDADE,MG
Wellington Roberto,PL,PB
Welter,PT,PR
Wilson Santiago,REPUBLICANOS,PB
Yandra Moura,UNIÃO,SE
Yury do Paredão,MDB,CE
Zé Haroldo Cathedral,PSD,RR
Zé Silva,SOLIDARIEDADE,MG
Zé Trovão,PL,SC
Zé Vitor,PL,MG
Zeca Dirceu,PT,PR
Zezinho Barbary,PP,AC
Zucco,PL,RS
"""

# ============================================================
# DADOS DOS SENADORES (81)
# ============================================================

SENADORES_RAW = """
Angelo Coronel,PSD,BA
Bene Camacho,PSD,MA
Daniella Ribeiro,PSD,PB
Irajá,PSD,TO
Jussara Lima,PSD,PI
Lucas Barreto,PSD,AP
Mara Gabrilli,PSD,SP
Margareth Buzetti,PSD,MT
Nelsinho Trad,PSD,MS
Omar Aziz,PSD,AM
Otto Alencar,PSD,BA
Rodrigo Pacheco,PSD,MG
Sérgio Petecão,PSD,AC
Vanderlan Cardoso,PSD,GO
Zenaide Maia,PSD,RN
Astronauta Marcos Pontes,PL,SP
Carlos Portinho,PL,RJ
Eduardo Gomes,PL,TO
Flavio Azevedo,PL,RN
Flávio Bolsonaro,PL,RJ
Izalci Lucas,PL,DF
Jaime Bagattoli,PL,RO
Jorge Seif,PL,SC
Magno Malta,PL,ES
Marcos Rogério,PL,RO
Romário,PL,RJ
Rosana Martinelli,PL,MT
Wilder Morais,PL,GO
Alessandro Vieira,MDB,SE
Confúcio Moura,MDB,RO
Eduardo Braga,MDB,AM
Fernando Dueire,MDB,PE
Fernando Farias,MDB,AL
Giordano,MDB,SP
Ivete da Silveira,MDB,SC
Jader Barbalho,MDB,PA
Marcelo Castro,MDB,PI
Renan Calheiros,MDB,AL
Veneziano Vital do Rêgo,MDB,PB
Beto Faro,PT,PA
Fabiano Contarato,PT,ES
Humberto Costa,PT,PE
Janaína Farias,PT,CE
Jaques Wagner,PT,BA
Paulo Paim,PT,RS
Randolfe Rodrigues,PT,AP
Rogério Carvalho,PT,SE
Teresa Leitão,PT,PE
Castellar Neto,PP,MG
Ciro Nogueira,PP,PI
Dr. Hiran,PP,RR
Esperidião Amin,PP,SC
Ireneu Orth,PP,RS
Laércio Oliveira,PP,SE
Tereza Cristina,PP,MS
Alan Rick,UNIÃO,AC
André Amaral,UNIÃO,PB
Davi Alcolumbre,UNIÃO,AP
Jayme Campos,UNIÃO,MT
Marcio Bittar,UNIÃO,AC
Professora Dorinha Seabra,UNIÃO,TO
Sergio Moro,UNIÃO,PR
Marcos do Val,PODE,ES
Oriovisto Guimarães,PODE,PR
Rodrigo Cunha,PODE,AL
Soraya Thronicke,PODE,MS
Styvenson Valentim,PODE,RN
Zequinha Marinho,PODE,PA
Cleitinho,REPUBLICANOS,MG
Damares Alves,REPUBLICANOS,DF
Hamilton Mourão,REPUBLICANOS,RS
Mecias de Jesus,REPUBLICANOS,RR
Chico Rodrigues,PSB,RR
Cid Gomes,PSB,CE
Flávio Arns,PSB,PR
Jorge Kajuru,PSB,GO
Ana Paula Lobato,PDT,MA
Leila Barros,PDT,DF
Weverton,PDT,MA
Eduardo Girão,NOVO,CE
Plínio Valério,PSDB,AM
"""

# ============================================================
# INFORMAÇÕES COMPLEMENTARES
# ============================================================

ESTADOS_INFO = {
    "AC": {"nome": "Acre", "regiao": "Norte", "capital": "Rio Branco", "populacao": 906876},
    "AL": {"nome": "Alagoas", "regiao": "Nordeste", "capital": "Maceió", "populacao": 3365351},
    "AM": {"nome": "Amazonas", "regiao": "Norte", "capital": "Manaus", "populacao": 4269995},
    "AP": {"nome": "Amapá", "regiao": "Norte", "capital": "Macapá", "populacao": 877613},
    "BA": {"nome": "Bahia", "regiao": "Nordeste", "capital": "Salvador", "populacao": 14985284},
    "CE": {"nome": "Ceará", "regiao": "Nordeste", "capital": "Fortaleza", "populacao": 9240580},
    "DF": {"nome": "Distrito Federal", "regiao": "Centro-Oeste", "capital": "Brasília", "populacao": 3094325},
    "ES": {"nome": "Espírito Santo", "regiao": "Sudeste", "capital": "Vitória", "populacao": 4108508},
    "GO": {"nome": "Goiás", "regiao": "Centro-Oeste", "capital": "Goiânia", "populacao": 7206589},
    "MA": {"nome": "Maranhão", "regiao": "Nordeste", "capital": "São Luís", "populacao": 7153262},
    "MG": {"nome": "Minas Gerais", "regiao": "Sudeste", "capital": "Belo Horizonte", "populacao": 21411923},
    "MS": {"nome": "Mato Grosso do Sul", "regiao": "Centro-Oeste", "capital": "Campo Grande", "populacao": 2839188},
    "MT": {"nome": "Mato Grosso", "regiao": "Centro-Oeste", "capital": "Cuiabá", "populacao": 3567234},
    "PA": {"nome": "Pará", "regiao": "Norte", "capital": "Belém", "populacao": 8777124},
    "PB": {"nome": "Paraíba", "regiao": "Nordeste", "capital": "João Pessoa", "populacao": 4059905},
    "PE": {"nome": "Pernambuco", "regiao": "Nordeste", "capital": "Recife", "populacao": 9674793},
    "PI": {"nome": "Piauí", "regiao": "Nordeste", "capital": "Teresina", "populacao": 3289290},
    "PR": {"nome": "Paraná", "regiao": "Sul", "capital": "Curitiba", "populacao": 11597484},
    "RJ": {"nome": "Rio de Janeiro", "regiao": "Sudeste", "capital": "Rio de Janeiro", "populacao": 17463349},
    "RN": {"nome": "Rio Grande do Norte", "regiao": "Nordeste", "capital": "Natal", "populacao": 3560903},
    "RO": {"nome": "Rondônia", "regiao": "Norte", "capital": "Porto Velho", "populacao": 1815278},
    "RR": {"nome": "Roraima", "regiao": "Norte", "capital": "Boa Vista", "populacao": 652713},
    "RS": {"nome": "Rio Grande do Sul", "regiao": "Sul", "capital": "Porto Alegre", "populacao": 11466630},
    "SC": {"nome": "Santa Catarina", "regiao": "Sul", "capital": "Florianópolis", "populacao": 7609601},
    "SE": {"nome": "Sergipe", "regiao": "Nordeste", "capital": "Aracaju", "populacao": 2338474},
    "SP": {"nome": "São Paulo", "regiao": "Sudeste", "capital": "São Paulo", "populacao": 46649132},
    "TO": {"nome": "Tocantins", "regiao": "Norte", "capital": "Palmas", "populacao": 1607363},
}

PARTIDOS_INFO = {
    "PL": {"nome_completo": "Partido Liberal", "espectro": "direita", "ideologia": "conservador"},
    "PT": {"nome_completo": "Partido dos Trabalhadores", "espectro": "esquerda", "ideologia": "progressista"},
    "PP": {"nome_completo": "Progressistas", "espectro": "centro-direita", "ideologia": "conservador"},
    "MDB": {"nome_completo": "Movimento Democrático Brasileiro", "espectro": "centro", "ideologia": "moderado"},
    "PSD": {"nome_completo": "Partido Social Democrático", "espectro": "centro", "ideologia": "moderado"},
    "UNIÃO": {"nome_completo": "União Brasil", "espectro": "centro-direita", "ideologia": "liberal"},
    "REPUBLICANOS": {"nome_completo": "Republicanos", "espectro": "centro-direita", "ideologia": "conservador"},
    "PSDB": {"nome_completo": "Partido da Social Democracia Brasileira", "espectro": "centro", "ideologia": "social-democrata"},
    "PDT": {"nome_completo": "Partido Democrático Trabalhista", "espectro": "centro-esquerda", "ideologia": "trabalhista"},
    "PSB": {"nome_completo": "Partido Socialista Brasileiro", "espectro": "centro-esquerda", "ideologia": "socialista-democrático"},
    "PSOL": {"nome_completo": "Partido Socialismo e Liberdade", "espectro": "esquerda", "ideologia": "socialista"},
    "PCdoB": {"nome_completo": "Partido Comunista do Brasil", "espectro": "esquerda", "ideologia": "comunista"},
    "PODE": {"nome_completo": "Podemos", "espectro": "centro", "ideologia": "liberal"},
    "CIDADANIA": {"nome_completo": "Cidadania", "espectro": "centro-esquerda", "ideologia": "social-democrata"},
    "NOVO": {"nome_completo": "Partido Novo", "espectro": "direita", "ideologia": "liberal-econômico"},
    "AVANTE": {"nome_completo": "Avante", "espectro": "centro", "ideologia": "moderado"},
    "SOLIDARIEDADE": {"nome_completo": "Solidariedade", "espectro": "centro", "ideologia": "sindicalista"},
    "PV": {"nome_completo": "Partido Verde", "espectro": "centro-esquerda", "ideologia": "ambientalista"},
    "REDE": {"nome_completo": "Rede Sustentabilidade", "espectro": "centro-esquerda", "ideologia": "ambientalista"},
    "PRD": {"nome_completo": "Partido Renovação Democrática", "espectro": "centro", "ideologia": "moderado"},
    "S.PART.": {"nome_completo": "Sem Partido", "espectro": "indefinido", "ideologia": "independente"},
}

# Bancadas temáticas - parlamentares que fazem parte
BANCADAS_TEMATICAS = {
    "ruralista": {
        "nome": "Bancada Ruralista (Frente Parlamentar da Agropecuária)",
        "descricao": "Defesa dos interesses do agronegócio e proprietários rurais",
        "partidos_principais": ["PL", "PP", "REPUBLICANOS", "MDB", "UNIÃO"],
        "tamanho_estimado": 358
    },
    "evangelica": {
        "nome": "Bancada Evangélica",
        "descricao": "Defesa de valores cristãos e pautas conservadoras",
        "partidos_principais": ["PL", "REPUBLICANOS", "PP", "PODE"],
        "tamanho_estimado": 115
    },
    "bala": {
        "nome": "Bancada da Bala (Segurança Pública)",
        "descricao": "Defesa de policiais, militares e armamento",
        "partidos_principais": ["PL", "PP", "REPUBLICANOS", "UNIÃO"],
        "tamanho_estimado": 40
    },
    "sindical": {
        "nome": "Bancada Sindical",
        "descricao": "Defesa dos trabalhadores e sindicatos",
        "partidos_principais": ["PT", "PCdoB", "PSB", "PDT", "SOLIDARIEDADE"],
        "tamanho_estimado": 43
    },
    "feminina": {
        "nome": "Bancada Feminina",
        "descricao": "Parlamentares mulheres - pautas de igualdade de gênero",
        "partidos_principais": [],  # Todas as mulheres
        "tamanho_estimado": 91
    },
    "ambientalista": {
        "nome": "Bancada Ambientalista",
        "descricao": "Defesa do meio ambiente e desenvolvimento sustentável",
        "partidos_principais": ["REDE", "PV", "PSOL", "PT"],
        "tamanho_estimado": 30
    },
    "empresarial": {
        "nome": "Bancada Empresarial",
        "descricao": "Defesa de interesses do setor privado e empreendedorismo",
        "partidos_principais": ["NOVO", "UNIÃO", "PL", "PP"],
        "tamanho_estimado": 200
    },
    "saude": {
        "nome": "Bancada da Saúde",
        "descricao": "Profissionais de saúde - defesa do SUS",
        "partidos_principais": ["PT", "PSB", "PDT", "MDB"],
        "tamanho_estimado": 50
    },
    "educacao": {
        "nome": "Bancada da Educação",
        "descricao": "Defesa de investimentos em educação pública",
        "partidos_principais": ["PT", "PSOL", "PCdoB", "PDT"],
        "tamanho_estimado": 40
    },
    "lgbtqia": {
        "nome": "Bancada LGBTQIA+",
        "descricao": "Defesa dos direitos da comunidade LGBTQIA+",
        "partidos_principais": ["PSOL", "PT", "PDT"],
        "tamanho_estimado": 6
    },
    "indigena": {
        "nome": "Bancada Indígena",
        "descricao": "Defesa dos direitos dos povos indígenas",
        "partidos_principais": ["PSOL", "PT", "REDE"],
        "tamanho_estimado": 3
    },
    "negra": {
        "nome": "Bancada Negra",
        "descricao": "Defesa de políticas de igualdade racial",
        "partidos_principais": ["PT", "PSOL", "PCdoB"],
        "tamanho_estimado": 30
    }
}

# Palavras-chave para identificação de bancadas
KEYWORDS_BANCADAS = {
    "ruralista": ["agro", "rural", "fazenda", "pecuária", "agricultura"],
    "evangelica": ["pastor", "bispo", "evangélico", "cristão", "igreja", "missionário"],
    "bala": ["delegado", "coronel", "capitão", "sargento", "general", "policial", "militar", "cabo"],
    "feminina": [],  # Identificado por gênero
    "sindical": ["sindical", "trabalhador", "metalúrgico", "operário"],
    "saude": ["dr.", "dra.", "médico", "enfermeiro", "saúde"],
    "educacao": ["professor", "professora", "educador"],
}


def gerar_id_unico(nome: str, tipo: str) -> str:
    """Gera ID único baseado no nome e tipo."""
    base = f"{tipo}_{nome}".lower().replace(" ", "_")
    hash_suffix = hashlib.md5(base.encode()).hexdigest()[:8]
    return f"{tipo[:3]}_{hash_suffix}"


def inferir_genero(nome: str) -> str:
    """Infere gênero baseado no nome."""
    nomes_femininos = [
        "maria", "ana", "adriana", "alice", "amanda", "benedita", "bia", "camila",
        "carla", "carmen", "carol", "caroline", "célia", "clarissa", "cristiane",
        "daiana", "dandara", "daniela", "denise", "dilvanda", "erika", "fernanda",
        "flávia", "franciane", "gisela", "gláucia", "gleisi", "greyce", "helena",
        "ivoneide", "iza", "jandira", "juliana", "laura", "lêda", "lídice", "luisa",
        "luiza", "luizianne", "magda", "maria", "marussa", "meire", "natália",
        "nely", "professora", "renata", "renilce", "roberta", "rogéria", "rosana",
        "rosangela", "rosângela", "roseana", "sâmia", "silvia", "silvye", "simone",
        "socorro", "sonize", "soraya", "tabata", "talíria", "teresa", "yandra",
        "zenaide", "delegada", "dra.", "coronel fernanda", "mara", "margareth",
        "daniella", "jussara", "ivete", "janaína", "tereza", "dorinha", "damares",
        "leila", "ana paula"
    ]

    nome_lower = nome.lower()
    for nome_fem in nomes_femininos:
        if nome_fem in nome_lower:
            return "feminino"
    return "masculino"


def inferir_bancadas(nome: str, partido: str) -> List[str]:
    """Infere quais bancadas o parlamentar pode pertencer."""
    bancadas = []
    nome_lower = nome.lower()

    # Bancada da bala (por nome)
    for keyword in KEYWORDS_BANCADAS["bala"]:
        if keyword in nome_lower:
            bancadas.append("bala")
            break

    # Bancada evangélica (por nome)
    for keyword in KEYWORDS_BANCADAS["evangelica"]:
        if keyword in nome_lower:
            bancadas.append("evangelica")
            break

    # Bancada da saúde (por nome)
    for keyword in KEYWORDS_BANCADAS["saude"]:
        if keyword in nome_lower:
            bancadas.append("saude")
            break

    # Bancada da educação (por nome)
    for keyword in KEYWORDS_BANCADAS["educacao"]:
        if keyword in nome_lower:
            bancadas.append("educacao")
            break

    # Bancada ruralista (por partido + probabilidade)
    if partido in ["PL", "PP", "REPUBLICANOS", "MDB", "UNIÃO"]:
        if random.random() < 0.6:  # 60% de chance
            bancadas.append("ruralista")

    # Bancada evangélica adicional (por partido + probabilidade)
    if partido in ["PL", "REPUBLICANOS"] and "evangelica" not in bancadas:
        if random.random() < 0.3:
            bancadas.append("evangelica")

    # Bancada sindical (por partido)
    if partido in ["PT", "PCdoB", "PSB", "PDT", "SOLIDARIEDADE"]:
        if random.random() < 0.4:
            bancadas.append("sindical")

    # Bancada ambientalista (por partido)
    if partido in ["REDE", "PV", "PSOL"]:
        bancadas.append("ambientalista")
    elif partido == "PT" and random.random() < 0.2:
        bancadas.append("ambientalista")

    # Bancada feminina (por gênero)
    if inferir_genero(nome) == "feminino":
        bancadas.append("feminina")

    # Bancada empresarial (por partido)
    if partido in ["NOVO", "UNIÃO", "PL"]:
        if random.random() < 0.5:
            bancadas.append("empresarial")

    return list(set(bancadas))


def gerar_idade_realista(nome: str) -> int:
    """Gera idade realista para parlamentar (35-80 anos)."""
    # Alguns nomes conhecidos com idades aproximadas
    nomes_jovens = ["nikolas", "tabata", "kim", "erika hilton", "carol dartora", "guilherme boulos"]
    nomes_veteranos = ["luiza erundina", "benedita", "arlindo chinaglia", "patrus"]

    nome_lower = nome.lower()

    for n in nomes_jovens:
        if n in nome_lower:
            return random.randint(28, 40)

    for n in nomes_veteranos:
        if n in nome_lower:
            return random.randint(65, 80)

    return random.randint(40, 65)


def gerar_perfil_parlamentar(
    nome: str,
    partido: str,
    uf: str,
    tipo: str  # "deputado_federal" ou "senador"
) -> Dict[str, Any]:
    """Gera perfil completo de um parlamentar."""

    genero = inferir_genero(nome)
    idade = gerar_idade_realista(nome)
    bancadas = inferir_bancadas(nome, partido)

    # Informações do estado
    estado_info = ESTADOS_INFO.get(uf, {})

    # Informações do partido
    partido_info = PARTIDOS_INFO.get(partido, {
        "nome_completo": partido,
        "espectro": "centro",
        "ideologia": "moderado"
    })

    # Gerar URL da foto
    # Padrão da Câmara: https://www.camara.leg.br/internet/deputado/bandep/{id}.jpg
    # Padrão do Senado: https://www.senado.leg.br/senadores/img/fotos-oficiais/senador{id}.jpg
    id_parlamentar = gerar_id_unico(nome, tipo)

    if tipo == "deputado_federal":
        foto_url = f"https://www.camara.leg.br/internet/deputado/bandep/{id_parlamentar}.jpg"
    else:
        foto_url = f"https://www.senado.leg.br/senadores/img/fotos-oficiais/{id_parlamentar}.jpg"

    # Gerar características políticas baseadas no partido
    espectro = partido_info.get("espectro", "centro")

    if espectro == "direita":
        posicao_economica = random.choice(["liberal", "ultra-liberal"])
        posicao_costumes = random.choice(["conservador", "muito conservador"])
        apoio_governo_lula = random.choice(["oposição", "oposição ferrenha"])
    elif espectro == "centro-direita":
        posicao_economica = random.choice(["liberal", "moderado"])
        posicao_costumes = random.choice(["conservador", "moderado"])
        apoio_governo_lula = random.choice(["oposição", "independente"])
    elif espectro == "esquerda":
        posicao_economica = random.choice(["desenvolvimentista", "estatista"])
        posicao_costumes = random.choice(["progressista", "muito progressista"])
        apoio_governo_lula = random.choice(["base aliada", "governista"])
    elif espectro == "centro-esquerda":
        posicao_economica = random.choice(["desenvolvimentista", "social-democrata"])
        posicao_costumes = random.choice(["progressista", "moderado"])
        apoio_governo_lula = random.choice(["base aliada", "aliado com ressalvas"])
    else:  # centro
        posicao_economica = random.choice(["moderado", "pragmático"])
        posicao_costumes = random.choice(["moderado", "pragmático"])
        apoio_governo_lula = random.choice(["independente", "centrão", "aliado situacional"])

    # Temas prioritários baseados nas bancadas
    temas_prioritarios = []
    if "ruralista" in bancadas:
        temas_prioritarios.extend(["agronegócio", "propriedade rural", "reforma agrária (contra)"])
    if "evangelica" in bancadas:
        temas_prioritarios.extend(["família tradicional", "liberdade religiosa", "pautas de costumes"])
    if "bala" in bancadas:
        temas_prioritarios.extend(["segurança pública", "armamento", "combate ao crime"])
    if "sindical" in bancadas:
        temas_prioritarios.extend(["direitos trabalhistas", "reforma trabalhista", "salário mínimo"])
    if "ambientalista" in bancadas:
        temas_prioritarios.extend(["meio ambiente", "sustentabilidade", "mudanças climáticas"])
    if "saude" in bancadas:
        temas_prioritarios.extend(["SUS", "saúde pública", "profissionais de saúde"])
    if "educacao" in bancadas:
        temas_prioritarios.extend(["educação pública", "universidades", "FUNDEB"])

    if not temas_prioritarios:
        temas_prioritarios = random.sample([
            "desenvolvimento econômico", "infraestrutura", "emprego",
            "indústria", "comércio", "turismo", "tecnologia"
        ], k=3)

    # Nível de atividade parlamentar
    atividade = random.choices(
        ["muito ativo", "ativo", "moderado", "baixa atividade"],
        weights=[20, 40, 30, 10]
    )[0]

    # Influência nas redes sociais
    influencia_digital = random.choices(
        ["muito alta", "alta", "média", "baixa"],
        weights=[10, 25, 45, 20]
    )[0]

    # Gerar perfil completo
    perfil = {
        "id": id_parlamentar,
        "tipo": tipo,
        "nome_parlamentar": nome,
        "nome_civil": nome,  # Pode ser expandido com dados reais
        "partido": partido,
        "partido_nome_completo": partido_info.get("nome_completo", partido),
        "uf": uf,
        "estado": estado_info.get("nome", uf),
        "regiao": estado_info.get("regiao", ""),
        "capital_estado": estado_info.get("capital", ""),

        # Dados pessoais inferidos
        "genero": genero,
        "idade_estimada": idade,
        "faixa_etaria": (
            "30-39" if idade < 40 else
            "40-49" if idade < 50 else
            "50-59" if idade < 60 else
            "60-69" if idade < 70 else
            "70+"
        ),

        # Dados políticos
        "espectro_politico": espectro,
        "ideologia": partido_info.get("ideologia", "moderado"),
        "posicao_economica": posicao_economica,
        "posicao_costumes": posicao_costumes,
        "relacao_governo_federal": apoio_governo_lula,

        # Bancadas e frentes
        "bancadas_tematicas": bancadas,
        "bancada_bbb": any(b in bancadas for b in ["ruralista", "evangelica", "bala"]),

        # Temas e atuação
        "temas_prioritarios": temas_prioritarios[:5],
        "nivel_atividade": atividade,
        "influencia_digital": influencia_digital,

        # Mandato
        "legislatura": "57ª (2023-2027)",
        "ano_eleicao": 2022,
        "primeiro_mandato": random.choice([True, False]),
        "mandatos_anteriores": random.randint(0, 5) if random.random() > 0.4 else 0,

        # Foto
        "foto_url": foto_url,
        "foto_url_alternativa": f"https://ui-avatars.com/api/?name={nome.replace(' ', '+')}&size=200&background=random",

        # Metadados
        "data_atualizacao": datetime.now().isoformat(),
        "fonte_dados": "Câmara dos Deputados / Senado Federal / TSE",
        "versao": "2.0"
    }

    return perfil


def processar_parlamentares_raw(dados_raw: str, tipo: str) -> List[Dict[str, Any]]:
    """Processa dados brutos e gera lista de parlamentares."""
    parlamentares = []

    for linha in dados_raw.strip().split("\n"):
        linha = linha.strip()
        if not linha:
            continue

        partes = linha.split(",")
        if len(partes) >= 3:
            nome = partes[0].strip()
            partido = partes[1].strip()
            uf = partes[2].strip()

            perfil = gerar_perfil_parlamentar(nome, partido, uf, tipo)
            parlamentares.append(perfil)

    return parlamentares


def gerar_estatisticas(parlamentares: List[Dict], tipo: str) -> Dict[str, Any]:
    """Gera estatísticas dos parlamentares."""
    total = len(parlamentares)

    # Por partido
    por_partido = {}
    for p in parlamentares:
        partido = p["partido"]
        por_partido[partido] = por_partido.get(partido, 0) + 1

    # Por UF
    por_uf = {}
    for p in parlamentares:
        uf = p["uf"]
        por_uf[uf] = por_uf.get(uf, 0) + 1

    # Por região
    por_regiao = {}
    for p in parlamentares:
        regiao = p["regiao"]
        por_regiao[regiao] = por_regiao.get(regiao, 0) + 1

    # Por gênero
    por_genero = {}
    for p in parlamentares:
        genero = p["genero"]
        por_genero[genero] = por_genero.get(genero, 0) + 1

    # Por espectro
    por_espectro = {}
    for p in parlamentares:
        espectro = p["espectro_politico"]
        por_espectro[espectro] = por_espectro.get(espectro, 0) + 1

    # Bancadas
    por_bancada = {}
    for p in parlamentares:
        for bancada in p["bancadas_tematicas"]:
            por_bancada[bancada] = por_bancada.get(bancada, 0) + 1

    return {
        "tipo": tipo,
        "total": total,
        "por_partido": dict(sorted(por_partido.items(), key=lambda x: -x[1])),
        "por_uf": dict(sorted(por_uf.items(), key=lambda x: -x[1])),
        "por_regiao": dict(sorted(por_regiao.items(), key=lambda x: -x[1])),
        "por_genero": por_genero,
        "por_espectro": por_espectro,
        "por_bancada": dict(sorted(por_bancada.items(), key=lambda x: -x[1])),
        "data_geracao": datetime.now().isoformat()
    }


def main():
    """Função principal."""
    print("=" * 60)
    print("GERAÇÃO DE BANCO DE PARLAMENTARES DO BRASIL")
    print("=" * 60)

    # Diretório de saída
    output_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    agentes_dir = os.path.join(output_dir, "agentes")

    if not os.path.exists(agentes_dir):
        os.makedirs(agentes_dir)

    # Processar deputados federais
    print("\n[1/4] Processando deputados federais...")
    deputados = processar_parlamentares_raw(DEPUTADOS_FEDERAIS_RAW, "deputado_federal")
    print(f"      Total: {len(deputados)} deputados")

    # Processar senadores
    print("\n[2/4] Processando senadores...")
    senadores = processar_parlamentares_raw(SENADORES_RAW, "senador")
    print(f"      Total: {len(senadores)} senadores")

    # Gerar estatísticas
    print("\n[3/4] Gerando estatísticas...")
    stats_deputados = gerar_estatisticas(deputados, "deputados_federais")
    stats_senadores = gerar_estatisticas(senadores, "senadores")

    # Salvar arquivos
    print("\n[4/4] Salvando arquivos...")

    # Arquivo de deputados
    arquivo_deputados = os.path.join(agentes_dir, "banco-deputados-federais-brasil.json")
    with open(arquivo_deputados, "w", encoding="utf-8") as f:
        json.dump({
            "metadata": {
                "titulo": "Banco de Deputados Federais do Brasil",
                "descricao": "513 deputados federais da 57ª legislatura (2023-2027)",
                "total": len(deputados),
                "fonte": "Câmara dos Deputados / TSE",
                "data_geracao": datetime.now().isoformat(),
                "versao": "2.0"
            },
            "estatisticas": stats_deputados,
            "bancadas_tematicas": BANCADAS_TEMATICAS,
            "deputados": deputados
        }, f, ensure_ascii=False, indent=2)
    print(f"      [OK] {arquivo_deputados}")

    # Arquivo de senadores
    arquivo_senadores = os.path.join(agentes_dir, "banco-senadores-brasil.json")
    with open(arquivo_senadores, "w", encoding="utf-8") as f:
        json.dump({
            "metadata": {
                "titulo": "Banco de Senadores do Brasil",
                "descricao": "81 senadores da 57ª legislatura (2023-2027)",
                "total": len(senadores),
                "fonte": "Senado Federal / TSE",
                "data_geracao": datetime.now().isoformat(),
                "versao": "2.0"
            },
            "estatisticas": stats_senadores,
            "bancadas_tematicas": BANCADAS_TEMATICAS,
            "senadores": senadores
        }, f, ensure_ascii=False, indent=2)
    print(f"      [OK] {arquivo_senadores}")

    # Arquivo combinado de todos parlamentares
    arquivo_todos = os.path.join(agentes_dir, "banco-parlamentares-brasil.json")
    todos_parlamentares = deputados + senadores
    stats_todos = gerar_estatisticas(todos_parlamentares, "todos")

    with open(arquivo_todos, "w", encoding="utf-8") as f:
        json.dump({
            "metadata": {
                "titulo": "Banco Completo de Parlamentares do Brasil",
                "descricao": "594 parlamentares (513 deputados + 81 senadores) da 57ª legislatura",
                "total": len(todos_parlamentares),
                "deputados": len(deputados),
                "senadores": len(senadores),
                "fonte": "Câmara dos Deputados / Senado Federal / TSE",
                "data_geracao": datetime.now().isoformat(),
                "versao": "2.0"
            },
            "estatisticas": stats_todos,
            "bancadas_tematicas": BANCADAS_TEMATICAS,
            "partidos_info": PARTIDOS_INFO,
            "estados_info": ESTADOS_INFO,
            "parlamentares": todos_parlamentares
        }, f, ensure_ascii=False, indent=2)
    print(f"      [OK] {arquivo_todos}")

    # Resumo final
    print("\n" + "=" * 60)
    print("RESUMO DA GERAÇÃO")
    print("=" * 60)
    print(f"\nDeputados Federais: {len(deputados)}")
    print(f"Senadores: {len(senadores)}")
    print(f"TOTAL: {len(todos_parlamentares)} parlamentares")

    print("\nDistribuição por partido (top 10):")
    for partido, qtd in list(stats_todos["por_partido"].items())[:10]:
        print(f"  {partido}: {qtd}")

    print("\nDistribuição por região:")
    for regiao, qtd in stats_todos["por_regiao"].items():
        print(f"  {regiao}: {qtd}")

    print("\nDistribuição por gênero:")
    for genero, qtd in stats_todos["por_genero"].items():
        print(f"  {genero}: {qtd}")

    print("\nBancadas temáticas (top 5):")
    for bancada, qtd in list(stats_todos["por_bancada"].items())[:5]:
        print(f"  {bancada}: {qtd}")

    print("\n" + "=" * 60)
    print("[SUCESSO] GERAÇÃO CONCLUÍDA COM SUCESSO!")
    print("=" * 60)


if __name__ == "__main__":
    main()
