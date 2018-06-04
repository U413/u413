select name from boards where id=(
  select board from topics where id=$1
);
