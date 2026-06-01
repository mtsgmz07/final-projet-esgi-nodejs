package com.example.fitapp

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity

class HomeActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_home)

        val btnProgram1 = findViewById<Button>(R.id.btnProgram1)
        val btnProgress = findViewById<Button>(R.id.btnProgress)
        val btnProfile = findViewById<Button>(R.id.btnProfile)

        btnProgram1.setOnClickListener {
            startActivity(Intent(this, ProgramDetailActivity::class.java))
        }

        btnProgress.setOnClickListener {
            startActivity(Intent(this, ProgressActivity::class.java))
        }

        btnProfile.setOnClickListener {
            startActivity(Intent(this, ProfileActivity::class.java))
        }

    }
}