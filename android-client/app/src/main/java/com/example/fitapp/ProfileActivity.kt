package com.example.fitapp

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class ProfileActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profile)

        val btnEditProfile = findViewById<Button>(R.id.btnEditProfile)
        val btnLogout = findViewById<Button>(R.id.btnLogout)

        btnEditProfile.setOnClickListener {
            Toast.makeText(this, "Modification du profil à venir", Toast.LENGTH_SHORT).show()
        }

        btnLogout.setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
    }
}