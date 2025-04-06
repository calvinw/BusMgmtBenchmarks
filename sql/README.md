
Open this readme.md file in the using **Open Preview**, it should display nicely formated with
the markdown rendered.

then go to the hamburger menu and select 

**Terminal > New Terminal**

then go and type `cd sql` (`cd` means change directory) to go to sql directory:

```bash
cd sql
```

This is where you will do you work. type `pwd` which is "print working
directory", which shows your current directory 

```bash
pwd
```

Type `ls`, this lists the files in the directory:

```bash
ls
```

`dolt` is installed already and the branch you are using currently the
year_test_branch branch of the database.  (this is already set up)

open the file `query.sql` in the editor and make some changes, there.

then run (type or copy/paste this) into the command line:

```bash
dolt sql < query.sql 
```

This command says run dolt and input sql commands from the file `query.sql`. if
you wanted to input commands from another script you would do this:

```bash
dolt sql < some_other_script.sql 
```

The problem with the first command above is you see a bunch of output that is
not that readable since it has too many columns. 

So you will always add something that makes the output go into a "pager" that
can display the rows and columns by using the arrow keys. The "pager" is called `pspg`
and the it makes the output scrollable and displays really nicely.

So copy and paste this into the terminal window:

```bash
dolt sql < query.sql | pspg 
```

This will let you see the whole table with the arrow keys. When you are done
looking at the output, you can hit the Q key and it will quit the output
display and give you back your terminal  

Once you get this working, your workflow is like this:

- Go to `query.sql` make some changes then come back to this command line, 
- Hit the up arrow will bring up previous commands 
- You can execute this command again once you get to it with the up arrow hit return to execute 


So now the goal is to fix `benchmarks_views.sql` and then you will run this to
see install the new benchmarks:

```bash
dolt sql < benchmarks_views.sql
```

Then to preview the changes go to `test_benchmarks.sql` and run it like this:

```bash
dolt sql < test_benchmarks.sql | pspg 
```

You can change the view that is displayed in `test_benchmarks.sql`

I think what needs to change is that we remove 2024 references completely
(we dont make a 2024 benchmark yet....until later this year)

Then we need to have benchmark reports for 2018 to 2023 for now. 
Some benchmarks use the previous 3 years, one has previou 2 years
1 has one previous year: 

(2023 ... 22,21,20 are previous 3 years)
(2022 ... 21,20,19 are previous 3 years)
(2021 ... 20,19,18 are previous 3 years)
(2020 ... 19,18 are previous 2 years)
(2019 ... 18 is the previous year)
(2018 ... no previous years)

So the querys for these views are all a little different 
and need to be fixed in `benchmarks_views.sql`

If you want to have the LLM help you, upload the file `schemas.sql` to it since
it has all the table definitions in it and so then the LLM (gemini probably
easiest) can help you revise the benchmark view definitions.

# To commit to the dolt database:

If you are in the `sql` directory you need to cd into BusMgmtBenchmarks directory before dolt commiting

```bash
cd BusMgmtBenchmarks 
```

Run status to see what is changed

```bash
dolt status
```
Then add everything that has changed. This is what the dot `.` means

```bash
dolt add . 
```

Then commit the change using -m to add a comment

```bash
dolt commit -m "I am commiting a change" 
```

Before you push your changes you have to pull any changes to the remote repo.
This is because if some other developer made changes you need to get those and
make sure your changes work with whatever was pushed while you were working.

```bash
dolt pull 
```

Finally do a dolt push to get your changes up to the remote repo.

```bash
dolt push
```
