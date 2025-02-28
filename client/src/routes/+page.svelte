<script lang="ts">
	import { onMount } from 'svelte';

	interface User {
		id: number;
		name: string;
		email: string;
	}

	let users: User[] = [];
	let name: string = ''; // Change `username` to `name`
	let email: string = '';

	// Fetch users from the backend
	const fetchUsers = async (): Promise<void> => {
		try {
			const response = await fetch('http://localhost:8080/users');
			if (!response.ok) throw new Error('Failed to fetch users');
			const data = await response.json();
			users = data;
		} catch (error) {
			console.error(error);
		}
	};

	// Add a new user to the backend
	const addUser = async (): Promise<void> => {
		if (!name || !email) {
			alert('Please provide both name and email');
			return;
		}
		try {
			const response = await fetch('http://localhost:8080/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ name, email }) // Send 'name' to backend
			});
			if (!response.ok) throw new Error('Failed to add user');
			const newUser = await response.json();
			users.push(newUser); // Add the new user to the list
			name = '';
			email = '';
		} catch (error) {
			console.error(error);
		}
	};

	// Fetch users on component mount
	onMount(fetchUsers);
</script>

<h1>Users</h1>

<!-- Form to add a new user -->
<form on:submit|preventDefault={addUser}>
	<label for="name">Name:</label>
	<input id="name" type="text" bind:value={name} />

	<label for="email">Email:</label>
	<input id="email" type="email" bind:value={email} />

	<button type="submit">Add User</button>
</form>

<!-- Display users -->
<h2>All Users</h2>
<ul>
	{#each users as user (user.id)}
		<li>{user.name} - {user.email}</li>
		<!-- Display 'name' -->
	{/each}
</ul>

<style>
	input,
	button {
		margin: 5px;
	}
</style>
