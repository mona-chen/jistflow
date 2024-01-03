#!/bin/bash
if [ -d $HOME/.config/containers/systemd ]; then
	mkdir -pv $(grep -F "Volume=" $HOME/.config/containers/systemd/iceshrimp-*.container | sed "s|%h|$HOME|g" | cut -d= -f2 | cut -d: -f1);

	db_env=$(grep -F "EnvironmentFile=" $HOME/.config/containers/systemd/iceshrimp-db.container | sed "s|%h|$HOME|g" | cut -d= -f2)
	config_dir=$(grep -F ":/iceshrimp/.config" $HOME/.config/containers/systemd/iceshrimp-web.container | sed "s|%h|$HOME|g" | cut -d= -f2 | cut -d: -f1)

	if [ ! -f $config_dir/docker_example.env ]; then
		wget -O $db_env \
				https://iceshrimp.dev/iceshrimp/iceshrimp/raw/branch/dev/.config/docker_example.env;
	else
		cp -v $config_dir/docker_example.env $db_env;
	fi

	if [ ! -f $config_dir/example-docker.yml ]; then
		wget -O $config_dir/default.yml \
				https://iceshrimp.dev/iceshrimp/iceshrimp/raw/branch/dev/.config/example-docker.yml;
	else
		cp $config_dir/example-docker.yml $config_dir/default.yml
	fi
else
	echo "No $HOME/.config/containers/systemd found"
	exit 1
fi
