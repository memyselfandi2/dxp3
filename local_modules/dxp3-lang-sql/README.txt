****************************************
* DXP3 - Digital Experience Platform 3 *
*                                      *
* MODULE: dxp3-lang-sql                *
****************************************

****************************************
* EXAMPLES                             *
****************************************
// Select all rows and all columns.
select * from USERS;
select FIRST_NAME, LAST_NAME from USERS;
// Alias
select FIRST_NAME as FirstName, LAST_NAME as Surname from USERS;
// Whitespace
select FIRST_NAME as [First Name] from USERS;
// Where clause
select FIRST_NAME, LAST_NAME from USERS where LAST_NAME="Smith";
// Where clause operators
select FIRST_NAME, LAST_NAME where AGE = 20;
select FIRST_NAME, LAST_NAME where AGE > 20;
select FIRST_NAME, LAST_NAME where AGE < 20;
select FIRST_NAME, LAST_NAME where AGE >= 20;
select FIRST_NAME, LAST_NAME where AGE <= 20;
select FIRST_NAME, LAST_NAME where AGE <> 20;
select FIRST_NAME, LAST_NAME where AGE != 20;
select FIRST_NAME, LAST_NAME where AGE in (10,20,30);
select FIRST_NAME, LAST_NAME where AGE between 15 and 25;

select FIRST_NAME, LAST_NAME from USERS where LAST_NAME="Smith" and AGE > 20;
select FIRST_NAME, LAST_NAME from USERS where LAST_NAME="Smith" or AGE > 20;
// Aggregate functions
select count(*) from USERS;
select max(AGE) from USERS;
select min(AGE) from USERS;
select sum(AGE) from USERS;
Select avg(AGE) from USERS;
// Distinct
select distinct LAST_NAME from USERS;
select count(distinct LAST_NAME) from USERS;