DATETIME = $(shell date +%Y%m%d%H%M%S)

bounce:
	sudo su - -c "R -e \"devtools::install_github('falling-fruit/fruitr')\""
	git pull
	bundle install
	bundle --deployment
	bundle exec rake db:migrate
	sudo chown -R www-data:www-data tmp
	sudo chmod -R 777 tmp
	bundle exec rake tmp:cache:clear
	bundle exec rake assets:precompile
	thin -C /etc/thin/fallingfruit.yaml restart
	#sudo /etc/init.d/thin restart -C /etc/thin1.9.1/fallingfruit.yml

export:
	#cp export_csv.sql /tmp/
	#sudo su postgres -c "psql -f /tmp/export_csv.sql fallingfruit_db"
	#cp /tmp/ff.csv.bz2 public/data.csv.bz2
	time bundle exec rake export:data
	rm -f public/locations.csv.bz2
	bzip2 public/locations.csv
	rm -f public/types.csv.bz2
	bzip2 public/types.csv

clusters:
	bundle exec rake make_clusters

devserver:
	#pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log start
	bundle exec thin -e development start

syncfrombackup:
	scp ubuntu@erichtho.smallwhitecube.com:/var/www/falling-fruit/db/backups/fallingfruit.latest.sql ./
	bash util/load_backup.sh fallingfruit.latest.sql
	#sudo su postgres -c "dropdb fallingfruit_test_db"
	#sudo su postgres -c "createdb fallingfruit_test_db -T fallingfruit_db -O fallingfruit_user"
